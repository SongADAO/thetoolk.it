"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";

import { config } from "@/app/config/wagmi";

// import FrameProvider from "./frame-provider";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Readonly<Props>) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
          {/* <FrameProvider>{children}</FrameProvider> */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
