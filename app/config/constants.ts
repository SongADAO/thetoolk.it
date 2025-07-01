/* eslint-disable import/group-exports, @typescript-eslint/no-unsafe-type-assertion */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const USE_TESTNET = process.env.NEXT_PUBLIC_USE_TESTNET === "true";

// API Keys
// =============================================================================
export const WALLET_CONNECT_PROJECT_ID: string = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ?? "";

export const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID;

// // Song Index
// // =============================================================================
// export const ALGOLIA_APPLICATION_ID = process.env.VITE_ALGOLIA_APPLICATION_ID;
// export const ALGOLIA_SEARCH_KEY = process.env.VITE_ALGOLIA_SEARCH_KEY;
// export const ALGOLIA_INDEX_NAME_TESTNET = process.env.VITE_ALGOLIA_INDEX_NAME_TESTNET;
// export const ALGOLIA_INDEX_NAME = process.env.VITE_ALGOLIA_INDEX_NAME;

// // GBM v3 L2
// // =============================================================================
// // Hugh Mann GBM Base Sepolia
// export const GBM_L2_SEPOLIA_CHAIN = Number(process.env.VITE_GBM_L2_SEPOLIA_CHAIN) as 7777777 | 8453 | 84532 | 11155111;
// export const GBM_L2_SEPOLIA_CONTRACT_ADDRESS = process.env.VITE_GBM_L2_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`;
// export const GBM_L2_SEPOLIA_SUBGRAPH_URL = process.env.VITE_GBM_L2_SEPOLIA_SUBGRAPH_URL;

// // Hugh Mann GBM Base
// export const GBM_L2_BASE_CHAIN = Number(process.env.VITE_GBM_L2_BASE_CHAIN) as 7777777 | 8453 | 84532 | 11155111;
// export const GBM_L2_BASE_CONTRACT_ADDRESS = process.env.VITE_GBM_L2_BASE_CONTRACT_ADDRESS as `0x${string}`;
// export const GBM_L2_BASE_SUBGRAPH_URL = process.env.VITE_GBM_L2_BASE_SUBGRAPH_URL;
