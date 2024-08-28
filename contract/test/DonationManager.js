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

      expect(await donationManager.hasRole(await donationManager.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });
  });

  describe('charity management', function () {
    it('should add charity with name and wallet', async function () {
      const { donationManager, owner, charity1 } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setCharityWallet('charity1', charity1.address);

      expect(await donationManager.charities('charity1')).to.equal(charity1.address);
    });

    it('should reject non admin wallet', async function () {
      const { donationManager, charity1 } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager.connect(charity1).setCharityWallet('charity1', charity1.address),
      ).to.be.revertedWithCustomError(donationManager, 'AccessControlUnauthorizedAccount');
    });
  });

  describe('quick donate', function () {
    it('should donate eth to random charity', async function () {
      const { donationManager, owner, charity1, donor1 } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setCharityWallet('charity1', charity1.address);

      await expect(
        donationManager.connect(donor1).quickDonate(1, { value: ethers.parseEther('0.001') }),
      ).to.changeEtherBalance(charity1, ethers.parseEther('0.001'));
    });

    it('should accumulate donate record for donor', async function () {
      const { donationManager, owner, charity1, donor1 } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setCharityWallet('charity1', charity1.address);
      await donationManager.connect(donor1).quickDonate(1, { value: ethers.parseEther('0.001') });
      await donationManager.connect(donor1).quickDonate(1, { value: ethers.parseEther('0.001') });

      expect(await donationManager.donationByPassId(1, ethers.ZeroAddress)).to.equal(ethers.parseEther('0.002'));
    });
  });
});
