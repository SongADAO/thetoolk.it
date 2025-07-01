"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { WagmiProvider } from "wagmi";

import { config } from "@/app/config/wagmi";

// import FrameProvider from "./frame-provider";

const queryClient = new QueryClient();

export function Providers({
  children,
}: {
  readonly children: React.ReactNode;
}) {
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
