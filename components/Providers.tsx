"use client"

import { isDevEnv } from "@/lib/env"
import { PrivyProvider } from "@privy-io/react-auth"

const DEV_ENABLE_AUTH = true
export default function Providers({ children }: { children: React.ReactNode }) {
  if (!DEV_ENABLE_AUTH && isDevEnv()) return children
  return (
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
  )
}
