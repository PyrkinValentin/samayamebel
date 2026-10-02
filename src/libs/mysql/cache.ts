import type { MutationOption } from "drizzle-orm/cache/core/cache"
import type { CacheConfig } from "drizzle-orm/cache/core/types"

import { Redis } from "ioredis"
import { pack, unpack } from "msgpackr"
import { createHash } from "crypto"
import { getTableName, is, Table } from "drizzle-orm"

import { REDIS_URL } from "@/constants"

// @typescript-eslint/no-explicit-any
const requests = new Map<string, Promise<any>>()

const UNDEFINED_CACHE_MARKER = "__VAL_IS_UNDEFINED__"

const globalForRedis = globalThis as unknown as {
	redis?: Redis,
}

const redis =
	globalForRedis.redis ??
	new Redis(REDIS_URL, {
		retryStrategy: (times) => Math.min(times * 50, 2000),
		maxRetriesPerRequest: 6,
		enableOfflineQueue: true,
	})

if (process.env.NODE_ENV !== "production") {
	globalForRedis.redis = redis
}

const serialize = (value: unknown): Buffer => {
	if (Buffer.isBuffer(value)) {
		return value
	}

	try {
		return pack(value)
	} catch (error) {
		throw error
	}
}

const deserialize = <T>(data: Buffer | Uint8Array | null | undefined): T | undefined => {
	if (
		data === null ||
		data === undefined ||
		data.length === 0
	) {
		return undefined
	}

	try {
		return unpack(data) as T
	} catch {
		return undefined
	}
}

const generateDataKey = (tags: string[]): string => {
	const sortedTags = [...tags]
		.sort()
		.join(",")

	return createHash("sha256")
		.update(sortedTags)
		.digest("hex")
}

const getCache = async <T>(...tags: string[]): Promise<T | undefined> => {
	if (tags.length === 0) return

	try {
		const dataKey = generateDataKey(tags)
		const data = await redis.getBuffer(dataKey)

		if (data && data.toString() === UNDEFINED_CACHE_MARKER) {
			return
		}

		return deserialize<T>(data)
	} catch {
		return
	}
}

const setCache = async (value: unknown, ttl: number, ...tags: string[]) => {
	if (tags.length === 0) return

	try {
		const dataKey = generateDataKey(tags)
		const pipeline = redis.pipeline()

		const payload = value === undefined
			? Buffer.from(UNDEFINED_CACHE_MARKER)
			: serialize(value)

		pipeline.set(dataKey, payload, "EX", ttl)

		tags.forEach((tag) => {
			pipeline.sadd(tag, dataKey)
			pipeline.expire(tag, ttl)
		})

		await pipeline.exec()
	} catch {
	}
}

const invalidateCache = async (...tags: string[]) => {
	if (tags.length === 0) return

	try {
		for (const tag of tags) {
			const dataKeys = await redis.smembers(tag)

			if (dataKeys && dataKeys.length > 0) {
				const pipeline = redis.pipeline()

				dataKeys.forEach((key) => pipeline.del(key))
				pipeline.del(tag)

				await pipeline.exec()
			}
		}
	} catch {
	}
}

const generateRequestKey = (key: string, tables: string[]) => {
	return `${tables.join(":")}:${key}`
}

const getRequest = (key: string, tables: string[]) => {
	const requestKey = generateRequestKey(key, tables)
	const request = requests.get(requestKey)

	if (request) return request

	const query = (async () => {
		try {
			return await getCache(...tables, key)
		} finally {
			requests.delete(requestKey)
		}
	})()

	requests.set(requestKey, query)

	return query
}

const getTtl = (config: CacheConfig | undefined) => {
	return config?.px
		? Math.max(Math.ceil(config.px / 1000), 1)
		: config?.ex ?? 3600
}

const getTables = (params: MutationOption) => {
	const tables: string[] = []

	const rawTables = params.tables
		? (Array.isArray(params.tables) ? params.tables : [params.tables])
		: []

	for (const table of rawTables) {
		tables.push(
			is(table, Table)
				? getTableName(table)
				: (table as string)
		)
	}

	return tables
}

const clearRequests = (tables: string[]) => {
	requests.forEach((_, key) => {
		const targetTable = tables.some((table) =>
			key
				.split(":")
				.includes(table)
		)

		if (targetTable) {
			requests.delete(key)
		}
	})
}

export const cache = {
	strategy: (): "explicit" | "all" => "explicit",
	get: (key: string, tables: string[]) => getRequest(key, tables),
	put: (key: string, value: unknown, tables: string[], _: boolean, config: CacheConfig | undefined) => {
		return setCache(value, getTtl(config), ...tables, key)
	},
	onMutate: async (params: MutationOption) => {
		const tables = getTables(params)

		await invalidateCache(...tables)
		clearRequests(tables)
	},
}