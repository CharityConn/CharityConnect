import { ethers } from 'hardhat';
const hre = require('hardhat');
require('dotenv/config');

async function main() {
  const provider = ethers.provider;

  // admin address must be different from deployer!!!, can't be same as deployer
  const privateKeyAdmin = process.env.PRIVATE_KEY_ADMIN;
  if (!privateKeyAdmin) {
    console.error('PRIVATE_KEY_ADMIN in .env required to deploy contract');
    return;
  }
  const admin = new ethers.Wallet(privateKeyAdmin, provider);

  console.log(`admin: ${admin.address}`);

  // const contract = (await ethers.getContractAt('RB404', '0xA346DDAD09151f0295dDa9586e10506A08474F13')).connect(admin);

  // await contract.claim('a', '0xae749AE248d9c7014b6a2E951542cdAa619e14C1');

  await contract.transferFrom('0x851438Ecb37FAe596DcD49bDe643D170F3aa225B', '0x37fC30f745238AD9347F84747017265CA1787c71', 100000000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
