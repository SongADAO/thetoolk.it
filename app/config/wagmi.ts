import { getDefaultConfig } from "@rainbow-me/rainbowkit";
// import { fallback, http, webSocket } from "wagmi";
import { fallback, http } from "wagmi";
import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
  zora,
} from "wagmi/chains";

import {
  INFURA_ID,
  USE_TESTNET,
  WALLET_CONNECT_PROJECT_ID,
} from "@/app/config/constants";

console.log(WALLET_CONNECT_PROJECT_ID);
export const config = getDefaultConfig({
  appName: "Hugh Harmony Creator",
  chains: [
    arbitrum,
    base,
    mainnet,
    optimism,
    polygon,
    zora,
    ...(USE_TESTNET ? [baseSepolia, sepolia] : []),
  ],
  projectId: WALLET_CONNECT_PROJECT_ID,
  // ssr: true,
  transports: {
    [arbitrum.id]: fallback([
      // webSocket(`wss://arbitrum-mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://arbitrum-mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [base.id]: fallback([
      // webSocket(`wss://base-mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://base-mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [baseSepolia.id]: fallback([
      // webSocket(`wss://base-sepolia-rpc.publicnode.com`),
      http(),
    ]),
    [mainnet.id]: fallback([
      // webSocket(`wss://mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [optimism.id]: fallback([
      // webSocket(`wss://optimism-mainnet.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://optimism-mainnet.infura.io/v3/${INFURA_ID}`),
    ]),
    [polygon.id]: fallback([
      // webSocket(`wss://polygon.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://polygon.infura.io/v3/${INFURA_ID}`),
    ]),
    [sepolia.id]: fallback([
      // webSocket(`wss://sepolia.infura.io/ws/v3/${INFURA_ID}`),
      http(`https://sepolia.infura.io/v3/${INFURA_ID}`),
    ]),
    [zora.id]: http(),
  },
});
