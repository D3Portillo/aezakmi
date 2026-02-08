"use client"

import type { Address, Hex } from "viem"

import { useRef, useState } from "react"
import useSWR from "swr/immutable"

import { createWalletClient, http, keccak256 } from "viem"
import { useSignMessage } from "@privy-io/react-auth"
import { mainnet } from "viem/chains"
import { privateKeyToAccount } from "viem/accounts"

import {
  type RPCAppDefinition,
  type MessageSigner,
  type AuthChallengeResponse,
  createAppSessionMessage,
  parseAnyRPCResponse,
  RPCProtocolVersion,
  createECDSAMessageSigner,
  createAuthRequestMessage,
  createEIP712AuthMessageSigner,
  createAuthVerifyMessage,
  RPCMethod,
} from "@erc7824/nitrolite"
import { useAuth } from "./wallet"

import { ONE_DAY_IN_SECONDS } from "./constants"

export const useYellowNetwork = () => {
  const [isSessionActive, setIsSessionActive] = useState(false)

  let messageSignerRef = useRef<MessageSigner | null>(null)

  const { evmAddress } = useAuth()
  const { signMessage } = useSignMessage({
    onSuccess() {
      console.debug("[useYellowNetwork::useSignMessage] Message Signed")
    },
    onError(error) {
      console.debug("[useYellowNetwork::useSignMessage] Error:", { error })
    },
  })

  const { data: ws = null } = useSWR("yellow.main", () => {
    const ws = new WebSocket("wss://clearnet-sandbox.yellow.com/ws")

    ws.onopen = () => {
      console.debug("[useYellowNetwork] WebSocket connected")
    }

    ws.onmessage = (event) => {
      const message = parseAnyRPCResponse(event.data)
      console.debug("[useYellowNetwork] Message:", message)
    }

    ws.onerror = (error) => {
      console.debug("[useYellowNetwork] Error:", { error })
    }

    return ws
  })

  // @see https://docs.yellow.org/docs/build/quick-start/#step-3-create-application-session
  async function setupMessageSigner() {
    if (!evmAddress) throw new Error("Wallet not connected")

    const { signature } = await signMessage(
      { message: "CREATE_APP_SESSION" },
      {
        uiOptions: {
          showWalletUIs: false,
        },
      },
    )

    // Use the signature to create signer for this session
    const seedFromSignature = keccak256(signature as Hex)
    const messageSigner = createECDSAMessageSigner(seedFromSignature)

    const account = privateKeyToAccount(seedFromSignature)

    const walletClient = createWalletClient({
      transport: http(),
      chain: mainnet,
      account,
    })

    return {
      account,
      walletClient,
      sessionAddress: account.address,
      messageSigner,
    }
  }

  async function createSession(partnerAddress: Address) {
    if (!ws) throw new Error("WebSocket not connected")

    const { messageSigner, sessionAddress, walletClient } =
      await setupMessageSigner()

    const definition: RPCAppDefinition = {
      application: "cza-game-v1",
      challenge: 0,
      participants: [sessionAddress, partnerAddress],
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      quorum: 100,
      weights: [50, 50],
      nonce: Date.now(),
    }

    const authParams = {
      address: sessionAddress,
      application: "cza-game-v1",
      expires_at: BigInt(
        String(Math.floor(Date.now() / 1000) + ONE_DAY_IN_SECONDS),
      ),
      allowances: [],
      scope: "app.all",
      session_key: sessionAddress,
    }

    // https://docs.yellow.org/docs/protocol/off-chain/authentication/#session-key-authentication-flow
    const authMessage = await createAuthRequestMessage(authParams)

    ws.send(authMessage)

    const challenge: AuthChallengeResponse = await new Promise((resolve) => {
      ws.addEventListener("message", function handler(event) {
        const message = parseAnyRPCResponse(event.data)
        if (message.method === RPCMethod.AuthChallenge) {
          console.debug(
            "[useYellowNetwork::createSession] Auth Challenge:",
            message,
          )
          resolve(message)
        }
      })
    })

    const eip712Signer = createEIP712AuthMessageSigner(
      walletClient,
      authParams as any,
      {
        name: "cza-game-v1",
      },
    )

    const authVerifyMessage = await createAuthVerifyMessage(
      eip712Signer,
      challenge,
    )

    await ws.send(authVerifyMessage)

    // Create signed session message
    // @ts-ignore
    const sessionMessage = await createAppSessionMessage(messageSigner, {
      definition,
    })

    // Send to ClearNode
    ws.send(sessionMessage)
    await new Promise((resolve, reject) => {
      ws.addEventListener("message", function handler(event) {
        const message = parseAnyRPCResponse(event.data)
        if (message.method === RPCMethod.AuthVerify) {
          resolve(message)
        } else reject()
      })
    })

    // Store the signer for future messages in this session
    messageSignerRef.current = messageSigner
    setIsSessionActive(true)

    console.debug("✅ Session created!")
    return { definition }
  }

  async function sendPayment(amount: BigInt, recipient: Address) {
    const paymentData = {
      type: "payment",
      amount: amount.toString(),
      recipient,
      timestamp: Date.now(),
    }

    ws?.send(JSON.stringify(paymentData))
    console.debug(`💸 Sent ${amount} instantly!`)
  }

  return {
    ws,
    createSession,
    sendPayment,
    isSessionActive,
  }
}
