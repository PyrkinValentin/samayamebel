import { Redis } from "ioredis"

import { REDIS_URL } from "@/constants"

const globalForRedis = globalThis as unknown as {
	redis?: Redis,
}

export const redis =
	globalForRedis.redis ??
	new Redis(REDIS_URL, {
		retryStrategy: (times) => Math.min(times * 50, 2000),
		maxRetriesPerRequest: 6,
		enableOfflineQueue: true,
	})

if (process.env.NODE_ENV !== "production") {
	globalForRedis.redis = redis
}