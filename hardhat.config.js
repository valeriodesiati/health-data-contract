// hardhat.config.js
// Configurazione di Hardhat per compilare e testare gli smart contract.
// Include anche il gas reporter per misurare il consumo di gas e la configurazione per la verifica su Etherscan.

import { config as dotenvConfig } from "dotenv";
dotenvConfig();

import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";

export default {
  solidity: "0.8.28",
  networks: {
    // Configurazione della rete Hardhat (locale) con 10 account predefiniti.
    hardhat: {
      accounts: {
        count: 10,
      },
    },
    // Esempio di configurazione per una rete esterna
    // amoy: {
    //   url: process.env.INFURA_URL,
    //   accounts: [process.env.DEPLOYER_PRIVATE_KEY]
    // },
  },
  etherscan: {
    // Configurazione per la verifica dei contratti su Etherscan (o block explorer similare).
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      }
    ]
  },
  gasReporter: {
    // Abilita il gas reporter e imposta la valuta per la stima dei costi.
    enabled: true,
    currency: 'USD',
  },
  sourcify: {
    enabled: false
  }
};
