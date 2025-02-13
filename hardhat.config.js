import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

export default {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      accounts: {
        count: 10,
      },
    },
    amoy: {
      url: process.env.INFURA_URL, // URL RPC per Amoy
      accounts: { mnemonic: process.env.MNEMONIC },
      chainId: 80002, // Assicurati che il chainId corrisponda a quello della rete Amoy
    },
  },
  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  sourcify: {
    enabled: false,
  },
};
