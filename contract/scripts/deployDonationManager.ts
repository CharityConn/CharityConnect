import { ethers, upgrades } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

const deployedAddress = '0x0f3C589c755d9cC8FeC60Ce47Cd8404670234166';

async function main() {
  let chainId = await hre.network.provider.send('eth_chainId');
  chainId = BigInt(chainId).toString();

  const provider = ethers.provider;

  // admin address must be different from deployer!!!, can't be same as deployer
  const privateKeyAdmin = process.env.PRIVATE_KEY_ADMIN;
  if (!privateKeyAdmin) {
    console.error('PRIVATE_KEY_ADMIN in .env required to deploy contract');
    return;
  }
  const admin = new ethers.Wallet(privateKeyAdmin, provider);

  console.log(`admin: ${admin.address}`);

  if (deployedAddress) {
    const contractFactory = (await ethers.getContractFactory('DonationManagerV2')).connect(admin);

    const donationManager = await upgrades.upgradeProxy(deployedAddress, contractFactory);

    console.log(`contract upgraded at ${donationManager.target}`);
  } else {
    const contractFactory = (await ethers.getContractFactory('DonationManager')).connect(admin);
    const donationManager = await upgrades.deployProxy(contractFactory, [
      '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721',
      '0x6E651E97D10D330b761b1759DA88616c4764093d',
    ]);
    await donationManager.waitForDeployment();

    console.log(`contract deployed to ${donationManager.target}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
