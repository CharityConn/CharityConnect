const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('DonationManager', function () {
  async function deployTokenFixture() {
    const [owner, defaultCharity, charity1, donor1, donor2] = await ethers.getSigners();

    const CharityConnectMembershipCard = await ethers.getContractFactory('CharityConnectMembershipCard');
    const charityConnectMembershipCard = await upgrades.deployProxy(CharityConnectMembershipCard, [
      'Charity Connect Membership Card',
      'CCMC',
    ]);
    await charityConnectMembershipCard.waitForDeployment();

    const Charityeet = await ethers.getContractFactory('Charityeet');
    const charityeet = await upgrades.deployProxy(Charityeet, ['CHARITYeet', 'CYT', 0]);
    await charityeet.waitForDeployment();

    const DonationManager = await ethers.getContractFactory('DonationManager');
    const donationManager = await upgrades.deployProxy(DonationManager, [
      await charityConnectMembershipCard.getAddress(),
      await charityeet.getAddress(),
    ]);
    await donationManager.waitForDeployment();

    await charityeet.grantRole(await charityeet.MANAGER_ROLE(), await donationManager.getAddress());
    await donationManager.connect(owner).setCharityWallet('defaultCharity', defaultCharity);

    await charityConnectMembershipCard.connect(donor1).claim();
    const donor1CardId = (await charityConnectMembershipCard.totalSupply()) - 1n;

    await charityConnectMembershipCard.connect(donor2).claim();
    const donor2CardId = (await charityConnectMembershipCard.totalSupply()) - 1n;

    return {
      charityConnectMembershipCard,
      charityeet,
      donationManager,
      owner,
      defaultCharity,
      charity1,
      donor1,
      donor1CardId,
      donor2,
      donor2CardId,
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

    it('should set default reward rate for eth', async function () {
      const { donationManager } = await loadFixture(deployTokenFixture);

      expect(await donationManager.rewardRates(ethers.ZeroAddress)).to.equal(75000000);
    });

    it('should set reward token', async function () {
      const { charityeet, donationManager } = await loadFixture(deployTokenFixture);

      expect(await donationManager.rewardToken()).to.equal(charityeet);
    });

    it('should set donation manager as manager role in charityeet', async function () {
      const { charityeet, donationManager } = await loadFixture(deployTokenFixture);

      expect(await charityeet.hasRole(await charityeet.MANAGER_ROLE(), await donationManager.getAddress())).to.equal(
        true,
      );
    });

    it('should set membership card', async function () {
      const { charityConnectMembershipCard, donationManager } = await loadFixture(deployTokenFixture);

      expect(await donationManager.membershipCard()).to.equal(charityConnectMembershipCard);
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

  describe('rate management', function () {
    it('should set fee rate', async function () {
      const { donationManager, owner } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setFeeRate(ethers.ZeroAddress, 100);

      expect(await donationManager.feeRates(ethers.ZeroAddress)).to.equal(100);
    });

    it('should set token reward rate', async function () {
      const { donationManager, owner } = await loadFixture(deployTokenFixture);

      await donationManager.connect(owner).setTokenRewardRate(ethers.ZeroAddress, 700000000);

      expect(await donationManager.rewardRates(ethers.ZeroAddress)).to.equal(700000000);
    });
  });

  describe('quick donate', function () {
    it('should donate eth to random charity with fee', async function () {
      const { donationManager, defaultCharity, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager.connect(donor1).quickDonate(donor1CardId, { value: ethers.parseEther('0.001005') }),
      ).to.changeEtherBalances(
        [defaultCharity, donationManager],
        [ethers.parseEther('0.001'), ethers.parseEther('0.000005')],
      );
    });

    it('should reward charityeet to donor', async function () {
      const { charityeet, donationManager, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager.connect(donor1).quickDonate(donor1CardId, { value: ethers.parseEther('0.001005') }),
      ).to.changeTokenBalance(charityeet, donor1, ethers.parseEther('7.5'));
    });

    it('should accumulate donate record for donor', async function () {
      const { donationManager, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager.connect(donor1).quickDonate(donor1CardId, { value: ethers.parseEther('0.001005') });
      await donationManager.connect(donor1).quickDonate(donor1CardId, { value: ethers.parseEther('0.001005') });

      expect(await donationManager.donationByCardId(donor1CardId, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('0.002'),
      );
    });

    it('should reject donation if membership card id', async function () {
      const { donationManager, donor1, donor2CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager.connect(donor1).quickDonate(donor2CardId, { value: ethers.parseEther('0.001005') }),
      ).to.be.revertedWith('Membership card not owned by donor');
    });
  });

  describe('donate eth to charity', function () {
    it('should donate eth to charity with fee', async function () {
      const { donationManager, defaultCharity, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager
          .connect(donor1)
          .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') }),
      ).to.changeEtherBalances([defaultCharity, donationManager], [ethers.parseEther('1'), ethers.parseEther('0.005')]);
    });

    it('should reward charityeet to donor', async function () {
      const { charityeet, donationManager, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager
          .connect(donor1)
          .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') }),
      ).to.changeTokenBalance(charityeet, donor1, ethers.parseEther('7500'));
    });

    it('should accumulate donate record for donor', async function () {
      const { donationManager, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager.connect(donor1).quickDonate(donor1CardId, { value: ethers.parseEther('0.001005') });
      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });

      expect(await donationManager.donationByCardId(donor1CardId, ethers.ZeroAddress)).to.equal(
        ethers.parseEther('1.001'),
      );
    });

    it('should reject donation if charity not found', async function () {
      const { donationManager, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager
          .connect(donor1)
          .donateETH(donor1CardId, 'unknownCharity', { value: ethers.parseEther('1.005') }),
      ).to.be.revertedWith('Unknown charity');
    });

    it('should reject donation if membership card id', async function () {
      const { donationManager, donor1, donor2CardId } = await loadFixture(deployTokenFixture);

      await expect(
        donationManager
          .connect(donor1)
          .donateETH(donor2CardId, 'defaultCharity', { value: ethers.parseEther('1.005') }),
      ).to.be.revertedWith('Membership card not owned by donor');
    });
  });

  describe('withdraw eth', function () {
    it('should withdraw eth to target address', async function () {
      const { donationManager, owner, charity1, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });

      await expect(
        donationManager.connect(owner).withdrawETH(charity1, ethers.parseEther('0.005')),
      ).to.changeEtherBalance(charity1, ethers.parseEther('0.005'));
    });

    it('should reject withdraw when non admin initiate it', async function () {
      const { donationManager, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });

      await expect(
        donationManager.connect(donor1).withdrawETH(donor1, ethers.parseEther('0.005')),
      ).to.be.revertedWithCustomError(donationManager, 'AccessControlUnauthorizedAccount');
    });

    it('should reject withdraw when insufficient balance', async function () {
      const { donationManager, owner, charity1, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });

      await expect(donationManager.connect(owner).withdrawETH(charity1, ethers.parseEther('0.006'))).to.be.revertedWith(
        'Insufficient balance',
      );
    });
  });

  describe('burn charityeet to charity', function () {
    it('should burn charityeet', async function () {
      const { donationManager, charityeet, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });
      await charityeet.connect(donor1).approve(await donationManager.getAddress(), ethers.parseEther('7500'));

      await expect(
        donationManager.connect(donor1).burnTo('defaultCharity', ethers.parseEther('7500')),
      ).to.changeTokenBalance(charityeet, donor1, -ethers.parseEther('7500'));
    });

    it('should record total charityeet burned', async function () {
      const { donationManager, charityeet, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });
      await charityeet.connect(donor1).approve(await donationManager.getAddress(), ethers.parseEther('7500'));
      await donationManager.connect(donor1).burnTo('defaultCharity', ethers.parseEther('3000'));
      await donationManager.connect(donor1).burnTo('defaultCharity', ethers.parseEther('3000'));

      expect(await donationManager.burnedToCharity('defaultCharity')).to.equal(ethers.parseEther('6000'));
      expect(await donationManager.burnedFrom(donor1)).to.equal(ethers.parseEther('6000'));
    });

    it('should reject when insufficient allowance to burn', async function () {
      const { donationManager, charityeet, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });
      await charityeet.connect(donor1).approve(await donationManager.getAddress(), ethers.parseEther('7500'));

      await expect(
        donationManager.connect(donor1).burnTo('defaultCharity', ethers.parseEther('7501')),
      ).to.be.revertedWith('Insufficient allowance');
    });
  });

  describe('burn charityeet to charity connect', function () {
    it('should burn charityeet', async function () {
      const { donationManager, charityeet, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });
      await charityeet.connect(donor1).approve(await donationManager.getAddress(), ethers.parseEther('7500'));

      await expect(donationManager.connect(donor1).burn(ethers.parseEther('7500'))).to.changeTokenBalance(
        charityeet,
        donor1,
        -ethers.parseEther('7500'),
      );
    });

    it('should record total charityeet burned', async function () {
      const { donationManager, charityeet, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });
      await charityeet.connect(donor1).approve(await donationManager.getAddress(), ethers.parseEther('7500'));
      await donationManager.connect(donor1).burn(ethers.parseEther('3000'));
      await donationManager.connect(donor1).burn(ethers.parseEther('3000'));

      expect(await donationManager.totalBurnedToCC()).to.equal(ethers.parseEther('6000'));
      expect(await donationManager.burnedFrom(donor1)).to.equal(ethers.parseEther('6000'));
    });

    it('should reject when insufficient allowance to burn', async function () {
      const { donationManager, charityeet, donor1, donor1CardId } = await loadFixture(deployTokenFixture);

      await donationManager
        .connect(donor1)
        .donateETH(donor1CardId, 'defaultCharity', { value: ethers.parseEther('1.005') });
      await charityeet.connect(donor1).approve(await donationManager.getAddress(), ethers.parseEther('7500'));

      await expect(donationManager.connect(donor1).burn(ethers.parseEther('7501'))).to.be.revertedWith(
        'Insufficient allowance',
      );
    });
  });
});
