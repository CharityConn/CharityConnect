import { ethers } from "ethers";
import { serverProvider } from "../constant";
import { ERC20_ABI, ERC721_ABI } from "./abi";

export async function getDecimals(erc20: string) {
  return await new ethers.Contract(erc20, ERC20_ABI, serverProvider).decimals();
}

export function ownerOf(contract: string, tokenId: string) {
  return new ethers.Contract(contract, ERC721_ABI, serverProvider).ownerOf(
    tokenId
  );
}

export async function getApproved(
  owner: string,
  token: string,
  tokenId: string,
  dvp: string
) {
  const erc721Contract = new ethers.Contract(token, ERC721_ABI, serverProvider);

  try {
    return await erc721Contract.isApprovedForAll(owner, dvp);
  } catch (error) {
    console.error("isApprovedForAll failed, try getApproved function");

    return (
      (await erc721Contract.getApproved(tokenId)).toLowerCase() ===
      dvp.toLowerCase()
    );
  }
}

export function getContractOwner(contract: string) {
  return new ethers.Contract(contract, ERC721_ABI, serverProvider).owner();
}

export function balanceOf(contract: string, owner: string) {
  return new ethers.Contract(contract, ERC721_ABI, serverProvider).balanceOf(
    owner
  );
}
