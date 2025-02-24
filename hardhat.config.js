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
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  sourcify: {
    enabled: false,
  },
};
