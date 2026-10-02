import type { PaginationMeta } from "./types"

export const cast = <T>(...args: (T | T[] | null | undefined)[]): T[] => {
	return args
		.flat()
		.filter((item): item is T => item !== null && item !== undefined)
}

export const getPaginationMeta = (page: number, limit: number, totalItems: number): PaginationMeta => {
	const localLimit = Math.max(1, limit)
	const localPage = Math.max(1, page)
	const totalCount = Math.max(0, totalItems)
	const offset = (localPage - 1) * localLimit
	const totalPages = Math.ceil(totalCount / localLimit) || 1
	const outOfRange = offset >= totalCount

	return {
		page: localPage,
		offset,
		limit: localLimit,
		totalCount,
		totalPages,
		outOfRange,
	}
}