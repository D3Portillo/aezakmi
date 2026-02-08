"use client"

import type { Address } from "viem"
import { usePrivy } from "@privy-io/react-auth"
import useSWR from "swr"

import { beautifyAddress } from "./utils"
import { publicClient } from "./mainnet"

export const useAuth = () => {
  const { user, authenticated: isConnected, ...privy } = usePrivy()
  const EVM_ADDRESS = user?.wallet?.address || null

  const formattedAddress = EVM_ADDRESS
    ? beautifyAddress(EVM_ADDRESS)
    : "Loading..."

  const { data: ens = null } = useSWR(
    EVM_ADDRESS ? `ens.${EVM_ADDRESS}` : null,
    async () => {
      if (!EVM_ADDRESS) return null
      return await publicClient.getEnsName({ address: EVM_ADDRESS as any })
    },
  )

  const username = ens || user?.email?.address?.split("@")[0] || "PlayerOne"

  return {
    ...privy,
    user,
    username,
    evmAddress: EVM_ADDRESS as Address | null,
    formattedEvmAddress: formattedAddress,
    isConnected,
  }
}
