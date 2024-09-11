import { ethers, upgrades } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

// const deployedAddress = null;
// const deployedAddress = '0x87Aa0A8d5E560F413Eb7C1E860EC3741Ad5cb7DD'; // base testnet
const deployedAddress = '0x504E041f9A381a7a52e1496f248908C664095b88'; // base mainnet

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
    const contractFactory = (await ethers.getContractFactory('DonationManagerV2')).connect(admin);
    const donationManager = await upgrades.deployProxy(contractFactory, [
      // '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721', // base testnet
      // '0x6E651E97D10D330b761b1759DA88616c4764093d', // base testnet
      '0x2F6F12b68165aBb483484927919D0d3fE450462E', // base mainnet
      '0xce8FEC9a10D4642368f124593098f2E4dD643652', // base mainnet
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
