import { ethers, upgrades } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

// const deployedAddress = null;
// const deployedAddress = '0x6E651E97D10D330b761b1759DA88616c4764093d' // base testnet
const deployedAddress = '0xce8FEC9a10D4642368f124593098f2E4dD643652' // base mainnet

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
    const contractFactory = (await ethers.getContractFactory('CharityeetV2')).connect(admin);
    const charityeet = await upgrades.upgradeProxy(deployedAddress, contractFactory);

    console.log(`contract upgraded at ${charityeet.target}`);
  } else {
    const contractFactory = (await ethers.getContractFactory('Charityeet')).connect(admin);
    const charityeet = await upgrades.deployProxy(contractFactory, ['CHARITYeet', 'CHTY', 0]);
    await charityeet.waitForDeployment();
  
    console.log(`contract deployed to ${charityeet.target}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
