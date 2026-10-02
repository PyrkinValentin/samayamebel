import type { Cache, MutationOption } from "drizzle-orm/cache/core/cache"
import type { CacheConfig } from "drizzle-orm/cache/core/types"

import { getTableName, is, Table } from "drizzle-orm"
import { getCache, setCache, invalidateCache } from "../redis"

// eslint-disable-next-line
const requests = new Map<string, Promise<any>>()

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

export const cache: Cache = {
	strategy: () => "explicit",
	get: (key, tables) => getRequest(key, tables),
	put: (key, value, tables, _, config) => {
		return setCache(value, getTtl(config), ...tables, key)
	},
	onMutate: async (params) => {
		const tables = getTables(params)

		await invalidateCache(...tables)
		clearRequests(tables)
	},
}