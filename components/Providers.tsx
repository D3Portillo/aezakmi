"use client"

import { PrivyProvider } from "@privy-io/react-auth"
import { RealtimeProvider } from "@upstash/realtime/client"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
        config={{
          embeddedWallets: {
            ethereum: {
              createOnLogin: "all-users",
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </RealtimeProvider>
  )
}
