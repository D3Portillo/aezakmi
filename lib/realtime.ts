import { Realtime, InferRealtimeEvents } from "@upstash/realtime"
import { z } from "zod"

import { redis } from "@/lib/redis"

const playerSchema = z.object({
  id: z.string(),
  username: z.string().nullable(),
  joinedAt: z.number(),
})

const schema = {
  matchmaking: {
    queueUpdate: z.object({
      total: z.number().int().nonnegative(),
    }),
    matchFound: z.object({
      roomId: z.string(),
      players: z.array(playerSchema).length(2),
    }),
  },
}

export const realtime = new Realtime({ redis, schema })
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>
