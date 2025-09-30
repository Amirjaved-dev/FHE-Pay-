import { expect } from "chai";
import { ethers } from "hardhat";

describe("Simple Test", function () {
  it("Should pass a simple test", async function () {
    expect(1 + 1).to.equal(2);
  });

  it("Should deploy contract", async function () {
    const PayrollStream = await ethers.getContractFactory("PayrollStream");
    const payrollStream = await PayrollStream.deploy();
    await payrollStream.waitForDeployment();

    expect(await payrollStream.owner()).to.not.be.undefined;
  });
});