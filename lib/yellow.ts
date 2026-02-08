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
  type AuthVerifyResponse,
  createTransferMessage,
} from "@erc7824/nitrolite"
import { useAuth } from "./wallet"

import { ONE_DAY_IN_SECONDS } from "./constants"

type YellowEvent = {
  method: string
  params?: unknown
}

export const useYellowNetwork = () => {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [latestEvent, setLatestEvent] = useState<YellowEvent | null>(null)

  const messageSignerRef = useRef<MessageSigner | null>(null)

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
    return new WebSocket("wss://clearnet-sandbox.yellow.com/ws")
  })

  // @see https://docs.yellow.org/docs/build/quick-start/#step-3-create-application-session
  const setupMessageSigner = async () => {
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

  const createSession = async (partnerAddress: Address) => {
    if (!ws) throw new Error("WebSocket not connected")

    const { messageSigner, sessionAddress, walletClient } =
      await setupMessageSigner()

    const firstParticipant =
      BigInt(sessionAddress) > BigInt(partnerAddress)
        ? partnerAddress
        : sessionAddress

    const secondParticipant =
      firstParticipant === sessionAddress ? partnerAddress : sessionAddress

    const definition: RPCAppDefinition = {
      application: "cza-game-v1",
      challenge: 0,
      // Make sure we keep same order
      participants: [firstParticipant, secondParticipant],
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      quorum: 100,
      weights: [50, 50],
      nonce: Date.now() / (1_000 * 60 * 5), // Increment in chunks of 5min
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
    const session: AuthVerifyResponse = await new Promise((resolve, reject) => {
      ws.addEventListener("message", function handler(event) {
        const message = parseAnyRPCResponse(event.data)
        if (message.method === RPCMethod.AuthVerify && message.params.success) {
          resolve(message)
        } else reject()
      })
    })

    // Store the signer for future messages in this session
    messageSignerRef.current = messageSigner
    setIsSessionActive(true)

    console.debug("✅ Session created!")

    return { definition, session }
  }

  const sendEvent = async (
    recipient: string,
    eventType: string,
    payload: any,
  ) => {
    if (!ws) throw new Error("WebSocket not connected")
    if (!isSessionActive) {
      throw new Error("Yellow Network session is not active")
    }

    console.debug({ eventType, payload })
    ws.send(
      await createTransferMessage(messageSignerRef.current!, {
        allocations: [],
        destination: recipient as any,
        destination_user_tag: JSON.stringify({
          type: eventType,
          data: payload,
        }),
      }),
    )

    console.debug(`[sendEvent] Sent: ${eventType}`, payload)
  }

  return {
    ws,
    createSession,
    sendEvent,
    isSessionActive,
    latestEvent,
  }
}
