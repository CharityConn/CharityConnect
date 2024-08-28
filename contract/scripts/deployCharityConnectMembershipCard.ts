import { ethers, upgrades } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

const deployedAddress = '0x40dc7D0B5E11Ee259314C548a238b9c909A4B721';

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
    const contractFactory = (await ethers.getContractFactory('CharityConnectMembershipCardV2')).connect(admin);
    const ccmc = await upgrades.upgradeProxy(deployedAddress, contractFactory);

    console.log(`contract upgraded at ${ccmc.target}`);
  } else {
    const contractFactory = (await ethers.getContractFactory('CharityConnectMembershipCard')).connect(admin);
    const ccmc = await upgrades.deployProxy(contractFactory, ['Charity Connect Membership Card', 'CCMC']);
    await ccmc.waitForDeployment();

    console.log(`contract deployed to ${ccmc.target}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
