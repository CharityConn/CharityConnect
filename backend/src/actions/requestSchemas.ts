import { z } from "zod";

export const sellingOfferPostSchema = z.object({
  offer: z.object({
    token: z.string(),
    id: z.string(),
    receiverIdType: z.literal("email"),
    receiver: z.string(),
    erc20: z.string(),
    price: z.string(),
  }),
  dvp: z.string(),
  signature: z.string(),
  scriptURI: z.string(),
});
export type SellingOfferRequest = z.infer<typeof sellingOfferPostSchema>;

export const claimingOfferPostSchema = z.object({
  offer: z.object({
    token: z.string(),
    amount: z.string(),
    receiverIdType: z.enum(["email", "redbrick-wallet", "cat-loot-holder"]),
    erc20: z.string(),
    price: z.string(),
  }),
  dvp: z.string(),
  signature: z.string(),
  scriptURI: z.string(),
});
export type ClaimingOfferRequest = z.infer<typeof claimingOfferPostSchema>;

export const attestIdPostSchema = z.object({
  id: z.object({
    idType: z.enum(["email", "redbrick-wallet", "cat-loot-holder"]),
    value: z.string(),
    secret: z.string().optional(),
  }),
  signature: z.string(),
  scriptURI: z.string().default(""),
  expireTime: z.number().default(0),
  receiver: z.string(),
});
export type AttestIdRequest = z.infer<typeof attestIdPostSchema>;

export const deliveryPostSchema = z
  .object({
    offer: z.string(),
  })
  .merge(attestIdPostSchema);
export type DeliveryRequest = z.infer<typeof deliveryPostSchema>;

export const otpSecretPostSchema = z.object({
  otpType: z.literal("email"),
  target: z.string(),
});
export type OtpSecretRequest = z.infer<typeof otpSecretPostSchema>;

export const rawdataRequestSchema = z.object({
  attester: z.string(),
  tokenId: z.string(),
  chain: z.string(),
});

export const verifyWalletPostSchema = z.object({
  message: z.string(),
  signature: z.string(),
  receiver: z.string(),
});

export type VerifyWalletRequest = z.infer<typeof verifyWalletPostSchema>;
