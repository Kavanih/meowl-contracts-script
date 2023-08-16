import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Signer } from 'ethers';
import { MeowlFeeSharingWithCompounding, IUniswapV2Router02, IRewardsDistribution } from '../typechain-types';

describe('MeowlFeeSharingWithCompounding', function () {
    let meowlFeeSharing: MeowlFeeSharingWithCompounding;
    let owner: Signer;
    let user1: Signer;
    let mockUniswapRouter: IUniswapV2Router02;
    let mockRewardsDistribution: IRewardsDistribution;
  
    before(async function () {
        // Deploy the mock Uniswap router
        const MockUniswapRouter = await ethers.getContractFactory('IUniswapV2Router02');
        mockUniswapRouter = await MockUniswapRouter.deploy();
    
        const MockRewardsDistribution = await ethers.getContractFactory('IRewardsDistribution');
        mockRewardsDistribution = await MockRewardsDistribution.deploy();

        // Deploy the contract with the mock Uniswap router
        const MeowlFeeSharingWithCompounding = await ethers.getContractFactory('MeowlFeeSharingWithCompounding');
        meowlFeeSharing = await MeowlFeeSharingWithCompounding.deploy(mockRewardsDistribution.address,mockUniswapRouter.address) as MeowlFeeSharingWithCompounding;
    
        // Get signers
        [owner, user1] = await ethers.getSigners();
      });

    
  it('should allow deposits and withdrawals', async function () {
    // Deposit MEOWL tokens
    const depositAmount = ethers.utils.parseEther('10');
    await meowlFeeSharing.connect(user1).deposit(depositAmount);

        // Check user's shares and total shares
        const userShares = await meowlFeeSharing.userInfo(await user1.getAddress());
        const totalShares = await meowlFeeSharing.totalShares();
        expect(userShares).to.equal(totalShares);
    
        // Withdraw shares
        await meowlFeeSharing.connect(user1).withdraw(depositAmount);
    
        // Check user's shares and total shares after withdrawal
        const userSharesAfterWithdrawal = await meowlFeeSharing.userInfo(await user1.getAddress());
        const totalSharesAfterWithdrawal = await meowlFeeSharing.totalShares();
        expect(userSharesAfterWithdrawal).to.equal(totalSharesAfterWithdrawal);
      });
    
      /* */
    });