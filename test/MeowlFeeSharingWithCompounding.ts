import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MeowlFeeSharingWithCompounding", function () {
  async function deploymentFixture() {
    const [rewardsDistribution] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const FeeSharingSystem = await ethers.getContractFactory(
      "FeeSharingSystem"
    );
    const FeeSharingCompound = await ethers.getContractFactory(
      "MeowlFeeSharingWithCompounding"
    );
    const stakingToken = await Token.deploy("STAKING", "STK");
    await stakingToken.deployed();
    const rewardToken = await Token.deploy("REWARD", "RWD");
    await rewardToken.deployed();
    const feeSharingSystem = await FeeSharingSystem.deploy(
      rewardsDistribution.address,
      rewardToken.address,
      stakingToken.address
    );
    await feeSharingSystem.deployed();
    const feeSharingCompund = await FeeSharingCompound.deploy(
      feeSharingSystem.address,
      feeSharingSystem.address
    );
    return { rewardToken, stakingToken, feeSharingSystem, feeSharingCompund };
  }

  describe("Deployment", function () {
    it("Should deploy MeowlFeeSharingWithCompounding and set correct contracts", async () => {
      const { feeSharingCompund, feeSharingSystem } = await loadFixture(
        deploymentFixture
      );
      const _feeSharing = await feeSharingCompund.feeSharingSystem();
      expect(_feeSharing).to.equal(feeSharingSystem.address);
    });
  });

  describe("Deposit", function () {
    it("Should deposit correct amount", async () => {
      const [signer] = await ethers.getSigners();
      const { feeSharingCompund, stakingToken } = await loadFixture(
        deploymentFixture
      );
      const balb4 = await stakingToken.balanceOf(signer.address);
      const amount = ethers.utils.parseEther("100");
      await stakingToken.approve(feeSharingCompund.address, amount);
      await feeSharingCompund.deposit(amount);
      const balafter = await stakingToken.balanceOf(signer.address);
      expect(balb4.gt(balafter)).to.be.true;
      expect(balb4.sub(balafter).eq(amount));
    });
    it("Should revert for low deposit amount", async () => {
      const { feeSharingCompund, stakingToken } = await loadFixture(
        deploymentFixture
      );
      const amount = ethers.utils.parseEther("0.1");
      await stakingToken.approve(feeSharingCompund.address, amount);
      await expect(feeSharingCompund.deposit(amount)).to.be.revertedWith(
        "Deposit: Amount must be >= 1 MEOWL"
      );
    });
  });
});
