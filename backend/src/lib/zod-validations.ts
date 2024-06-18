import { ethers } from "ethers";
import z from "zod";

export function zEthereumAddress() {
  return z
    .string()
    .startsWith("0x")
    .toLowerCase()
    .refine((address) => ethers.isAddress(address), {
      message: "Invalid Ethereum address",
    });
}
