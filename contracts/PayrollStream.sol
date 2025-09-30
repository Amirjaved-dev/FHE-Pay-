// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@fhevm/solidity/lib/FHE.sol";
import "encrypted-types/EncryptedTypes.sol";

/**
 * @title PayrollStream
 * @dev A confidential salary streaming contract using FHEVM for privacy-preserving payroll
 */
contract PayrollStream {
    using FHE for euint128;
    using FHE for euint64;

    struct Stream {
        address employer;
        address employee;
        euint128 encryptedSalaryAmount;
        uint256 duration;
        uint256 startTime;
        uint256 totalWithdrawn;
        bool active;
        bytes32 employeePublicKey;
    }

    struct WithdrawalRequest {
        uint256 streamId;
        address employee;
        uint256 requestTime;
        bool processed;
        uint256 decryptedAmount;
    }

    // State variables
    mapping(uint256 => Stream) public streams;
    mapping(address => uint256[]) public employerStreams;
    mapping(address => uint256[]) public employeeStreams;
    mapping(uint256 => WithdrawalRequest) public withdrawalRequests;
    mapping(address => bytes32) public userPublicKeys;
    mapping(address => bool) public keyRegistered;

    uint256 public nextStreamId;
    uint256 public nextWithdrawalId;
    bool private _locked;
    bool public paused;
    address public owner;

    // Events
    event StreamCreated(
        uint256 indexed streamId,
        address indexed employer,
        address indexed employee,
        uint256 duration
    );

    event SalaryWithdrawn(
        uint256 indexed streamId,
        address indexed employee,
        uint256 amount
    );

    event WithdrawalRequested(
        uint256 indexed requestId,
        uint256 indexed streamId,
        address indexed employee
    );

    event StreamPaused(uint256 indexed streamId);
    event StreamResumed(uint256 indexed streamId);
    event FHEKeyRegistered(address indexed user, bytes32 publicKey);

    // Modifiers
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    modifier onlyStreamParticipant(uint256 streamId) {
        require(streamId < nextStreamId, "Stream does not exist");
        Stream storage stream = streams[streamId];
        require(
            msg.sender == stream.employer || msg.sender == stream.employee,
            "Not authorized"
        );
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier streamExists(uint256 streamId) {
        require(streamId < nextStreamId, "Stream does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        nextStreamId = 1;
        nextWithdrawalId = 1;
    }

    /**
     * @dev Register FHE public key for a user
     * @param publicKey The user's FHE public key
     */
    function registerFHEKey(bytes32 publicKey) external {
        userPublicKeys[msg.sender] = publicKey;
        keyRegistered[msg.sender] = true;
        emit FHEKeyRegistered(msg.sender, publicKey);
    }

    /**
     * @dev Create a new encrypted salary stream
     * @param employee The employee's address
     * @param inputHandle The encrypted salary amount input handle
     * @param inputProof The proof for the encrypted input
     * @param duration The stream duration in seconds
     * @param employeePublicKey The employee's FHE public key
     */
    function createStream(
        address employee,
        bytes32 inputHandle,
        bytes memory inputProof,
        uint256 duration,
        bytes32 employeePublicKey
    ) external payable whenNotPaused nonReentrant {
        require(employee != address(0), "Invalid employee address");
        require(employee != msg.sender, "Cannot create stream to self");
        require(duration > 0, "Duration must be positive");
        require(msg.value > 0, "Must fund the stream");
        require(keyRegistered[msg.sender], "Employer not registered");
        require(keyRegistered[employee], "Employee not registered");

        // Convert encrypted input to euint128
        externalEuint128 externalInput = externalEuint128.wrap(inputHandle);
        euint128 encryptedAmount = FHE.fromExternal(externalInput, inputProof);

        uint256 streamId = nextStreamId++;

        streams[streamId] = Stream({
            employer: msg.sender,
            employee: employee,
            encryptedSalaryAmount: encryptedAmount,
            duration: duration,
            startTime: block.timestamp,
            totalWithdrawn: 0,
            active: true,
            employeePublicKey: employeePublicKey
        });

        employerStreams[msg.sender].push(streamId);
        employeeStreams[employee].push(streamId);

        emit StreamCreated(streamId, msg.sender, employee, duration);
    }

    /**
     * @dev Calculate the encrypted earned amount for a stream
     * @param streamId The stream ID
     * @return The encrypted earned amount
     */
    function calculateEncryptedEarned(uint256 streamId)
        internal
        returns (euint128)
    {
        Stream storage stream = streams[streamId];
        require(stream.active, "Stream is not active");

        // Calculate time elapsed
        uint256 timeElapsed = block.timestamp - stream.startTime;
        if (timeElapsed > stream.duration) {
            timeElapsed = stream.duration;
        }

        // Check for division by zero
        require(stream.duration > 0, "Duration cannot be zero");

        // Calculate earned amount using FHE operations
        // earnedAmount = (encryptedSalaryAmount * timeElapsed) / duration
        euint64 timeRatio = FHE.asEuint64(uint64((timeElapsed * 1e6) / stream.duration));
        euint128 earnedAmount = FHE.mul(stream.encryptedSalaryAmount, FHE.asEuint128(timeRatio));
        earnedAmount = FHE.div(earnedAmount, uint128(1e6));

        return earnedAmount;
    }

    /**
     * @dev Get the encrypted earned amount for a stream
     * @param streamId The stream ID
     * @return The encrypted earned amount as handle
     */
    function getEncryptedEarnedAmount(uint256 streamId)
        external
        streamExists(streamId)
        onlyStreamParticipant(streamId)
        returns (bytes32)
    {
        euint128 earnedAmount = calculateEncryptedEarned(streamId);
        return euint128.unwrap(earnedAmount);
    }

    /**
     * @dev Request withdrawal of earned salary (async decryption)
     * @param streamId The stream ID
     */
    function requestWithdrawal(uint256 streamId)
        external
        streamExists(streamId)
        whenNotPaused
        nonReentrant
    {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.employee, "Only employee can withdraw");
        require(stream.active, "Stream is not active");

        uint256 requestId = nextWithdrawalId++;
        withdrawalRequests[requestId] = WithdrawalRequest({
            streamId: streamId,
            employee: msg.sender,
            requestTime: block.timestamp,
            processed: false,
            decryptedAmount: 0
        });

        // Calculate encrypted earned amount
        euint128 encryptedEarned = calculateEncryptedEarned(streamId);

        // Request async decryption
        bytes32[] memory ctsHandles = new bytes32[](1);
        ctsHandles[0] = euint128.unwrap(encryptedEarned);

        FHE.requestDecryption(
            ctsHandles,
            this.fulfillWithdrawal.selector
        );

        emit WithdrawalRequested(requestId, streamId, msg.sender);
    }

    /**
     * @dev Fulfill withdrawal after decryption (callback)
     * @param requestId The request ID
     * @param decryptedValues The decrypted earned amounts
     */
    function fulfillWithdrawal(uint256 requestId, uint256[] memory decryptedValues)
        external
    {
        // Security: Only FHE gateway should call this
        require(msg.sender == address(0), "Only FHE gateway can call this");

        WithdrawalRequest storage request = withdrawalRequests[requestId];
        require(!request.processed, "Request already processed");
        require(requestId < nextWithdrawalId, "Invalid request ID");

        Stream storage stream = streams[request.streamId];
        require(stream.active, "Stream is not active");

        uint256 decryptedAmount = decryptedValues[0];

        // Calculate available amount (considering previous withdrawals)
        uint256 availableAmount = decryptedAmount - stream.totalWithdrawn;
        require(availableAmount > 0, "No funds available for withdrawal");

        // Check contract has enough balance
        require(address(this).balance >= availableAmount, "Insufficient contract balance");

        // Update total withdrawn
        stream.totalWithdrawn += availableAmount;
        request.processed = true;
        request.decryptedAmount = decryptedAmount;

        // Transfer funds with gas limit optimization
        (bool success, ) = request.employee.call{value: availableAmount, gas: 50000}("");
        require(success, "Transfer failed");

        emit SalaryWithdrawn(request.streamId, request.employee, availableAmount);
    }

    /**
     * @dev Pause a stream (employer only)
     * @param streamId The stream ID
     */
    function pauseStream(uint256 streamId)
        external
        streamExists(streamId)
        whenNotPaused
    {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.employer, "Only employer can pause");
        require(stream.active, "Stream already paused");

        stream.active = false;
        emit StreamPaused(streamId);
    }

    /**
     * @dev Resume a paused stream (employer only)
     * @param streamId The stream ID
     */
    function resumeStream(uint256 streamId)
        external
        streamExists(streamId)
        whenNotPaused
    {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.employer, "Only employer can resume");
        require(!stream.active, "Stream is already active");

        stream.active = true;
        emit StreamResumed(streamId);
    }

    /**
     * @dev Get stream details
     * @param streamId The stream ID
     */
    function getStream(uint256 streamId)
        external
        view
        streamExists(streamId)
        onlyStreamParticipant(streamId)
        returns (
            address employer,
            address employee,
            uint256 duration,
            uint256 startTime,
            uint256 totalWithdrawn,
            bool active
        )
    {
        Stream storage stream = streams[streamId];
        return (
            stream.employer,
            stream.employee,
            stream.duration,
            stream.startTime,
            stream.totalWithdrawn,
            stream.active
        );
    }

    /**
     * @dev Get streams for an employer
     * @param employer The employer address
     */
    function getEmployerStreams(address employer)
        external
        view
        returns (uint256[] memory)
    {
        return employerStreams[employer];
    }

    /**
     * @dev Get streams for an employee
     * @param employee The employee address
     */
    function getEmployeeStreams(address employee)
        external
        view
        returns (uint256[] memory)
    {
        return employeeStreams[employee];
    }

    /**
     * @dev Get withdrawal request details
     * @param requestId The request ID
     */
    function getWithdrawalRequest(uint256 requestId)
        external
        view
        returns (
            uint256 streamId,
            address employee,
            uint256 requestTime,
            bool processed,
            uint256 decryptedAmount
        )
    {
        WithdrawalRequest storage request = withdrawalRequests[requestId];
        return (
            request.streamId,
            request.employee,
            request.requestTime,
            request.processed,
            request.decryptedAmount
        );
    }

    /**
     * @dev Emergency pause (owner only)
     */
    function emergencyPause() external onlyOwner {
        paused = true;
    }

    /**
     * @dev Resume from emergency pause (owner only)
     */
    function emergencyResume() external onlyOwner {
        paused = false;
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {}
}