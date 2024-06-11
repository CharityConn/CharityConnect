import { env } from "@/lib/env.mjs"

export const SELECTED_PASSID_COOKIE_KEY = "selectedPassId"
export const JOIN_DISCORD_LINK = "https://discord.gg/smartlayer"

export const isProd = env.NEXT_PUBLIC_VERCEL_ENV === "production"
export const SMART_CAT_SUIT_UP_CONTRACT_ADDRESS = isProd
  ? "0xD5cA946AC1c1F24Eb26dae9e1A53ba6a02bd97Fe"
  : "0x614cF3021705977c2eF4beb9D7f10a6bF4EAEBF6"

export const SMART_CAT_SUIT_UP_CONTRACT_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "passId",
        type: "uint256",
      },
      {
        name: "signature",
        type: "bytes",
      },
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
]

export const SMART_CAT_LOOT_CONTRACT_ADDRESS = isProd
  ? "0x0"
  : "0x6d3495B5d83f6479Ab3023784f52B11AC3794e2F"

export const SMART_CAT_LOOT_CONTRACT_ABI = [
  {
    constant: false,
    inputs: [],
    name: "tokensMinted",
    outputs: [
      {
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "mintStartTime",
    outputs: [
      {
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
]

export const WETH_CONTRACT_ADDRESS = isProd
  ? "0x0"
  : "0x3B0deCF3FCe1abD6717B045C47f4558C67fE79fa"

export const OPENSEA_URL = isProd
  ? "https://opensea.io/assets/matic"
  : "https://testnets.opensea.io/assets/mumbai"

export const HIDE_TOKENMICS_PAGE = true

export const SHOW_JOY_ID = !isProd

export const TOKEN_PARAM = "access_token"
export const ATT_TOKEN_PARAM = "att_token"

export const IMPORTED_PASSES = "imported-passes"
export const LOCAL_PASSES = "local-passes"

export const DVP_CONTRACT_ADDRESS = "0xE7c7cC7b540Ad0095B694D7500BA84753E41182f" //sale contract
export const DVP_OFFERCONTRACT_ADDRESS =
  "0x9090c7EA1A694E694a7Cc8701C976375b507A2fB" //offer contract todo
export const EAS_ADDRESS = "0xaEF4103A04090071165F78D45D83A0C0782c2B2a"
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
export const ERC20_ABI = [
  "function approve(address, uint256) external returns (bool)", //spender, value
  "function allowance(address, address) external view returns (uint256)", //owner, spender, output: allowance
  "function decimals() external pure returns (uint8)",
]

export const TOKEN_ABI = [
  "function claimedById(string) view returns (bool)",
  "function claimedByUid(bytes32 uid) public view returns (uint)",
  "function claimed() public view returns (uint)",
  "function totalClaimable() public view returns (uint)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed id)",
]

export const IDAttestationDomain = {
  name: "EAS Attestation",
  chainId: env.NEXT_PUBLIC_CHAIN_ID,
  version: "1.2.0",
} as const

export const types = {
  idData: [
    { name: "idType", type: "string" },
    { name: "value", type: "string" },
  ],
}

export const scriptURI = "" //for id attestation

export const ID_TYPE_REDBRICK_WALLET = "redbrick-wallet"
export const ID_TYPE_CAT_LOOT_HOLDER = "cat-loot-holder"

export const ID_TYPE_EMAIL = "email"
export const DVP_ABI = [
  "function perform(tuple(tuple( string ,string , uint256 ,address),tuple( bytes32 ,uint16 ,bytes32 , address,uint64 , uint64 ,bytes32 ,bool,bytes),tuple(uint8 ,bytes32 ,bytes32 ))  , tuple(tuple( string ,string , uint256 ,address),tuple( bytes32 ,uint16 ,bytes32 , address,uint64 , uint64 ,bytes32 ,bool,bytes),tuple(uint8 ,bytes32 ,bytes32 ))) external payable",
]

export const NOT_FOUND = "Account not found"
