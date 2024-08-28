const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('DonationManager', function () {
  async function deployTokenFixture() {
    const DonationManager = await ethers.getContractFactory('DonationManager');
    const [owner, charity1, donor1] = await ethers.getSigners();

    const donationManager = await await upgrades.deployProxy(DonationManager);
    await donationManager.waitForDeployment();

    return {
      DonationManager,
      donationManager,
      owner,
      charity1,
      donor1,
    };
  }

  describe('deployment', function () {
    it('should set owner as admin role', async function () {
      const { donationManager, owner } = await loadFixture(deployTokenFixture);

      expect(await donationManager.hasRole(await donationManager.DEFAULT_ADMIN_ROLE(), owner)).to.equal(true);
    });

    it('should set default fee rate for eth', async function () {
      const { donationManager } = await loadFixture(deployTokenFixture);

      expect(await donationManager.feeRates(ethers.ZeroAddress)).to.equal(50);
    });
  });

  describe('charity management', function () {
    it('should add charity with name and wallet', async function () {
      const { donationManager, owner, charity1 } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setCharityWallet('charity1', charity1);

      expect(await donationManager.charities('charity1')).to.equal(charity1);
    });

    it('should reject non admin wallet', async function () {
      const { donationManager, charity1 } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager.connect(charity1).setCharityWallet('charity1', charity1),
      ).to.be.revertedWithCustomError(donationManager, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('quick donate', function () {
    it('should set fee rate', async function () {
      const { donationManager, owner } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setFeeRate(ethers.ZeroAddress, 100);

      expect(await donationManager.feeRates(ethers.ZeroAddress)).to.equal(100);
    });

    it('should donate eth to random charity with fee', async function () {
      const { donationManager, owner, charity1, donor1 } = await loadFixture(deployTokenFixture);

      // only add one charity, not testing randomness
      await donationManager.connect(owner).setCharityWallet('charity1', charity1);

      await expect(
        donationManager.connect(donor1).quickDonate(1, { value: ethers.parseEther('0.001005') }),
      ).to.changeEtherBalances(
        [charity1, donationManager],
        [ethers.parseEther('0.001'), ethers.parseEther('0.000005')],
      );
    });

    it('should accumulate donate record for donor', async function () {
      const { donationManager, owner, charity1, donor1 } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setCharityWallet('charity1', charity1);
      await donationManager.connect(donor1).quickDonate(1, { value: ethers.parseEther('0.001005') });
      await donationManager.connect(donor1).quickDonate(1, { value: ethers.parseEther('0.001005') });

      expect(await donationManager.donationByPassId(1, ethers.ZeroAddress)).to.equal(ethers.parseEther('0.002'));
    });
  });
});
