import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("FeeSharingSystem", function () {
  async function deploymentFixture() {
    const [rewardsDistribution] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const FeeSharingSystem = await ethers.getContractFactory(
      "FeeSharingSystem"
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
    return { rewardToken, stakingToken, feeSharingSystem };
  }

  describe("Deployment", function () {
    it("Should deploy and set correct reward and staking token", async () => {
      const { rewardToken, stakingToken, feeSharingSystem } = await loadFixture(
        deploymentFixture
      );
      const _rewardTk = await feeSharingSystem.rewardsToken();
      const _stakeTK = await feeSharingSystem.stakingToken();
      expect(_rewardTk).to.equal(rewardToken.address);
      expect(_stakeTK).to.eq(stakingToken.address);
    });
  });

  it("It should stake and transfer correct amount", async () => {
    const [signer] = await ethers.getSigners();
    const { rewardToken, stakingToken, feeSharingSystem } = await loadFixture(
      deploymentFixture
    );
    const balb4 = await stakingToken.balanceOf(signer.address);
    const amount = ethers.utils.parseEther("100");
    await stakingToken.approve(feeSharingSystem.address, amount);
    await feeSharingSystem.stake(amount);
    const balafter = await stakingToken.balanceOf(signer.address);

    expect(balb4.gt(balafter)).to.be.true;
    expect(balb4.sub(balafter).eq(amount));
  });
});
