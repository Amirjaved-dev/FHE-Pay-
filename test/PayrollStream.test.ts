import { expect } from "chai";
import { ethers } from "hardhat";
import { PayrollStream } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PayrollStream", function () {
  let payrollStream: PayrollStream;
  let owner: SignerWithAddress;
  let employer: SignerWithAddress;
  let employee: SignerWithAddress;
  let otherAccount: SignerWithAddress;

  const STREAM_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
  const SALARY_AMOUNT = ethers.parseEther("10"); // 10 ETH
  const MOCK_PUBLIC_KEY = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const MOCK_ENCRYPTED_SALARY = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

  beforeEach(async function () {
    [owner, employer, employee, otherAccount] = await ethers.getSigners();

    const PayrollStreamFactory = await ethers.getContractFactory("PayrollStream");
    payrollStream = await PayrollStreamFactory.deploy();
    await payrollStream.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await payrollStream.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct default values", async function () {
      expect(await payrollStream.nextStreamId()).to.equal(1);
      expect(await payrollStream.nextWithdrawalId()).to.equal(1);
      expect(await payrollStream.paused()).to.equal(false);
    });
  });

  describe("FHE Key Registration", function () {
    it("Should allow users to register FHE public keys", async function () {
      await expect(payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY))
        .to.emit(payrollStream, "FHEKeyRegistered")
        .withArgs(employer.address, MOCK_PUBLIC_KEY);

      expect(await payrollStream.userPublicKeys(employer.address)).to.equal(MOCK_PUBLIC_KEY);
      expect(await payrollStream.keyRegistered(employer.address)).to.equal(true);
    });

    it("Should allow updating FHE public keys", async function () {
      const newKey = "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";
      
      await payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employer).registerFHEKey(newKey);
      
      expect(await payrollStream.userPublicKeys(employer.address)).to.equal(newKey);
    });
  });

  describe("Stream Creation", function () {
    beforeEach(async function () {
      await payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employee).registerFHEKey(MOCK_PUBLIC_KEY);
    });

    it("Should create a new stream successfully", async function () {
      // Create a mock input proof (this would normally come from FHE library)
      const mockInputProof = "0x";

      await expect(
        payrollStream.connect(employer).createStream(
          employee.address,
          MOCK_ENCRYPTED_SALARY,
          mockInputProof,
          STREAM_DURATION,
          MOCK_PUBLIC_KEY,
          { value: SALARY_AMOUNT }
        )
      )
        .to.emit(payrollStream, "StreamCreated")
        .withArgs(1, employer.address, employee.address, STREAM_DURATION);

      const streamDetails = await payrollStream.getStream(1);
      expect(streamDetails.employer).to.equal(employer.address);
      expect(streamDetails.employee).to.equal(employee.address);
      expect(streamDetails.duration).to.equal(STREAM_DURATION);
      expect(streamDetails.active).to.equal(true);
    });

    it("Should fail to create stream with invalid parameters", async function () {
      const mockInputProof = "0x";

      // Invalid employee address
      await expect(
        payrollStream.connect(employer).createStream(
          ethers.ZeroAddress,
          MOCK_ENCRYPTED_SALARY,
          mockInputProof,
          STREAM_DURATION,
          MOCK_PUBLIC_KEY,
          { value: SALARY_AMOUNT }
        )
      ).to.be.revertedWith("Invalid employee address");

      // Self-employment
      await expect(
        payrollStream.connect(employer).createStream(
          employer.address,
          MOCK_ENCRYPTED_SALARY,
          mockInputProof,
          STREAM_DURATION,
          MOCK_PUBLIC_KEY,
          { value: SALARY_AMOUNT }
        )
      ).to.be.revertedWith("Cannot create stream to self");

      // Zero duration
      await expect(
        payrollStream.connect(employer).createStream(
          employee.address,
          MOCK_ENCRYPTED_SALARY,
          mockInputProof,
          0,
          MOCK_PUBLIC_KEY,
          { value: SALARY_AMOUNT }
        )
      ).to.be.revertedWith("Duration must be positive");

      // No ETH sent
      await expect(
        payrollStream.connect(employer).createStream(
          employee.address,
          MOCK_ENCRYPTED_SALARY,
          mockInputProof,
          STREAM_DURATION,
          MOCK_PUBLIC_KEY,
          { value: 0 }
        )
      ).to.be.revertedWith("Must fund the stream");
    });

    it("Should track employer and employee streams", async function () {
      const mockInputProof = "0x";

      await payrollStream.connect(employer).createStream(
        employee.address,
        MOCK_ENCRYPTED_SALARY,
        mockInputProof,
        STREAM_DURATION,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );

      const employerStreams = await payrollStream.getEmployerStreams(employer.address);
      const employeeStreams = await payrollStream.getEmployeeStreams(employee.address);

      expect(employerStreams).to.deep.equal([1n]);
      expect(employeeStreams).to.deep.equal([1n]);
    });
  });

  describe("Stream Management", function () {
    beforeEach(async function () {
      await payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employee).registerFHEKey(MOCK_PUBLIC_KEY);
      
      const mockInputProof = "0x";
      await payrollStream.connect(employer).createStream(
        employee.address,
        MOCK_ENCRYPTED_SALARY,
        mockInputProof,
        STREAM_DURATION,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );
    });

    it("Should allow employer to pause stream", async function () {
      await expect(payrollStream.connect(employer).pauseStream(1))
        .to.emit(payrollStream, "StreamPaused")
        .withArgs(1);

      const streamDetails = await payrollStream.getStream(1);
      expect(streamDetails.active).to.equal(false);
    });

    it("Should allow employer to resume stream", async function () {
      await payrollStream.connect(employer).pauseStream(1);
      
      await expect(payrollStream.connect(employer).resumeStream(1))
        .to.emit(payrollStream, "StreamResumed")
        .withArgs(1);

      const streamDetails = await payrollStream.getStream(1);
      expect(streamDetails.active).to.equal(true);
    });

    it("Should not allow non-employer to pause/resume stream", async function () {
      await expect(
        payrollStream.connect(employee).pauseStream(1)
      ).to.be.revertedWith("Only employer can pause");

      await expect(
        payrollStream.connect(employee).resumeStream(1)
      ).to.be.revertedWith("Only employer can resume");
    });
  });

  describe("Withdrawal Process", function () {
    beforeEach(async function () {
      await payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employee).registerFHEKey(MOCK_PUBLIC_KEY);
      
      const mockInputProof = "0x";
      await payrollStream.connect(employer).createStream(
        employee.address,
        MOCK_ENCRYPTED_SALARY,
        mockInputProof,
        STREAM_DURATION,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );
    });

    it("Should allow employee to request withdrawal", async function () {
      // Fast forward time to allow some earnings
      await ethers.provider.send("evm_increaseTime", [STREAM_DURATION / 4]); // 25% of duration
      await ethers.provider.send("evm_mine", []);

      await expect(payrollStream.connect(employee).requestWithdrawal(1))
        .to.emit(payrollStream, "WithdrawalRequested")
        .withArgs(1, 1, employee.address);
    });

    it("Should not allow non-employee to request withdrawal", async function () {
      await expect(
        payrollStream.connect(employer).requestWithdrawal(1)
      ).to.be.revertedWith("Only employee can withdraw");

      await expect(
        payrollStream.connect(otherAccount).requestWithdrawal(1)
      ).to.be.revertedWith("Only employee can withdraw");
    });

    it("Should not allow withdrawal from inactive stream", async function () {
      await payrollStream.connect(employer).pauseStream(1);
      
      await expect(
        payrollStream.connect(employee).requestWithdrawal(1)
      ).to.be.revertedWith("Stream is not active");
    });

    it("Should process withdrawal and transfer funds", async function () {
      // Fast forward time to allow some earnings
      await ethers.provider.send("evm_increaseTime", [STREAM_DURATION / 2]); // 50% of duration
      await ethers.provider.send("evm_mine", []);

      const initialBalance = await ethers.provider.getBalance(employee.address);
      
      const tx = await payrollStream.connect(employee).requestWithdrawal(1);
      const receipt = await tx.wait();
      
      // Check if SalaryWithdrawn event was emitted
      const withdrawnEvent = receipt?.logs.find(
        log => payrollStream.interface.parseLog(log as any)?.name === "SalaryWithdrawn"
      );
      
      expect(withdrawnEvent).to.not.be.undefined;
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      await payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employee).registerFHEKey(MOCK_PUBLIC_KEY);
      
      const mockInputProof = "0x";
      await payrollStream.connect(employer).createStream(
        employee.address,
        MOCK_ENCRYPTED_SALARY,
        mockInputProof,
        STREAM_DURATION,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );
    });

    it("Should allow only stream participants to view encrypted earned amount", async function () {
      // Employer should be able to view
      await expect(
        payrollStream.connect(employer).getEncryptedEarnedAmount(1)
      ).to.not.be.reverted;

      // Employee should be able to view
      await expect(
        payrollStream.connect(employee).getEncryptedEarnedAmount(1)
      ).to.not.be.reverted;

      // Other accounts should not be able to view
      await expect(
        payrollStream.connect(otherAccount).getEncryptedEarnedAmount(1)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should not allow access to non-existent streams", async function () {
      await expect(
        payrollStream.connect(employee).getEncryptedEarnedAmount(999)
      ).to.be.revertedWith("Stream does not exist");
    });
  });

  describe("Contract Pause Functionality", function () {
    it("Should allow owner to pause and unpause contract", async function () {
      await expect(payrollStream.connect(owner).emergencyPause())
        .to.not.be.reverted;

      expect(await payrollStream.paused()).to.equal(true);

      await expect(payrollStream.connect(owner).emergencyResume())
        .to.not.be.reverted;

      expect(await payrollStream.paused()).to.equal(false);
    });

    it("Should not allow non-owner to pause contract", async function () {
      await expect(
        payrollStream.connect(employer).emergencyPause()
      ).to.be.revertedWith("Only owner");
    });

    it("Should prevent stream creation when paused", async function () {
      await payrollStream.connect(owner).emergencyPause();

      await expect(
        payrollStream.connect(employer).createStream(
          employee.address,
          MOCK_ENCRYPTED_SALARY,
          "0x",
          STREAM_DURATION,
          MOCK_PUBLIC_KEY,
          { value: SALARY_AMOUNT }
        )
      ).to.be.revertedWith("Contract is paused");
    });
  });

  describe("Utility Functions", function () {
    it("Should return correct contract balance", async function () {
      const initialBalance = await payrollStream.getContractBalance();
      expect(initialBalance).to.equal(0);

      const mockInputProof = "0x";
      await payrollStream.connect(employer).createStream(
        employee.address,
        MOCK_ENCRYPTED_SALARY,
        mockInputProof,
        STREAM_DURATION,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );

      const newBalance = await payrollStream.getContractBalance();
      expect(newBalance).to.equal(SALARY_AMOUNT);
    });

    it("Should receive ETH through fallback function", async function () {
      const sendAmount = ethers.parseEther("1");
      
      await employer.sendTransaction({
        to: await payrollStream.getAddress(),
        value: sendAmount
      });

      expect(await payrollStream.getContractBalance()).to.equal(sendAmount);
    });
  });

  describe("Multiple Streams", function () {
    it("Should handle multiple streams correctly", async function () {
      const employee2 = otherAccount;
      
      await payrollStream.connect(employer).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employee).registerFHEKey(MOCK_PUBLIC_KEY);
      await payrollStream.connect(employee2).registerFHEKey(MOCK_PUBLIC_KEY);

      // Create first stream
      const mockInputProof = "0x";
      await payrollStream.connect(employer).createStream(
        employee.address,
        MOCK_ENCRYPTED_SALARY,
        mockInputProof,
        STREAM_DURATION,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );

      // Create second stream
      await payrollStream.connect(employer).createStream(
        employee2.address,
        MOCK_ENCRYPTED_SALARY,
        STREAM_DURATION * 2,
        MOCK_PUBLIC_KEY,
        { value: SALARY_AMOUNT }
      );

      const employerStreams = await payrollStream.getEmployerStreams(employer.address);
      expect(employerStreams).to.deep.equal([1n, 2n]);

      const employee1Streams = await payrollStream.getEmployeeStreams(employee.address);
      const employee2Streams = await payrollStream.getEmployeeStreams(employee2.address);
      
      expect(employee1Streams).to.deep.equal([1n]);
      expect(employee2Streams).to.deep.equal([2n]);
    });
  });
});