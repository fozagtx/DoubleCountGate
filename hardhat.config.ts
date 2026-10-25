import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY?.trim();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: process.env.RPC_URL?.trim() || "http://127.0.0.1:8545",
      chainId: 31337,
    },
    hoodi: {
      url: process.env.HOODI_RPC_URL?.trim() || "https://rpc.hoodi.ethpandaops.io",
      chainId: 560048,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
  mocha: {
    timeout: 20000,
  },
};

export default config;
