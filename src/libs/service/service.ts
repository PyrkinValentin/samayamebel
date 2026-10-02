import type { SQL } from "drizzle-orm"
import type { MySqlTable } from "drizzle-orm/mysql-core/table"
import type { SelectedFields } from "drizzle-orm/mysql-core"

import type {
	BulkUpdateOptions,
	Columns,
	CountOptions,
	CreateOptions,
	CreateReturn,
	CreateServiceOptions,
	ExistsOptions,
	FindManyOptions,
	FindManyPaginatedOptions,
	FindOneOptions,
	InferInsert,
	RemoveOptions,
	UpdateOptions,
	UpsertOptions,
	UpsertReturn,
} from "./types"

import { mysql } from "@/libs/mysql"
import { count as drizzleCount, sql, and, getTableColumns, inArray } from "drizzle-orm"
import { cast, getPaginationMeta } from "./utils"

import { PAGINATION_PER_PAGE } from "./constants"

export const createService = <Table extends MySqlTable>(options: CreateServiceOptions<Table>) => {
	const { table, defaultOrderBy } = options

	const create = <Values extends InferInsert<Table> | InferInsert<Table>[], ReturnId extends boolean = false>(options: CreateOptions<Table, Values, ReturnId>) => {
		const { tx = mysql, returnId, values } = options

		const query = tx
			.insert(table)
			.values(values)
			.$dynamic()

		if (returnId) {
			query.$returningId()
		}

		return query as unknown as CreateReturn<Table, ReturnId>
	}

	const update = (options: UpdateOptions<Table>) => {
		const { tx = mysql, values, where, limit } = options

		const query = tx
			.update(table)
			.set(values)
			.$dynamic()

		if (where) query.where(where)
		if (limit) query.limit(limit)

		return query
	}

	const bulkUpdate = (options: BulkUpdateOptions<Table>) => {
		const { tx = mysql, values, where, limit } = options

		if (!values || values.length === 0) return

		const columns = getTableColumns(table)
		const idColumn = columns["id"]
		const ids = values.map((v) => v.id)

		const payload = Object.fromEntries(
			Array.from(new Set(values.flatMap(Object.keys)))
				.filter((key) => key !== "id" && columns[key])
				.map((colName) => {
					const dbColumn = columns[colName]

					const casesSql = sql.join(values.map((v) => {
							const value = v[colName]

							const finalValue = value !== undefined
								? value
								: dbColumn

							return sql`when
              ${idColumn} =
              ${v.id}
              then
              ${finalValue}`
						}),
						sql.raw(" ")
					)

					return [colName, sql`case ${casesSql} end`]
				})
		) as { [Key in keyof Table]?: SQL }

		if (Object.keys(payload).length > 0) {
			const localWhere = inArray(idColumn, ids)

			const query = tx
				.update(table)
				.set(payload)
				.$dynamic()

			query.where(
				where
					? and(localWhere, where)
					: localWhere
			)

			if (limit) query.limit(limit)

			return query
		}
	}

	const upsert = <ReturnId extends boolean = false>(options: UpsertOptions<Table, ReturnId>) => {
		const { tx = mysql, returnId, values, set } = options

		const query = tx
			.insert(table)
			.values(values as Table)
			.onDuplicateKeyUpdate({ set })
			.$dynamic()

		if (returnId) {
			query.$returningId()
		}

		return query as unknown as UpsertReturn<Table, ReturnId>
	}

	const remove = (options: RemoveOptions = {}) => {
		const { tx = mysql, where, limit } = options

		const query = tx
			.delete(table)
			.$dynamic()

		if (where) query.where(where)
		if (limit) query.limit(limit)

		return query
	}

	const count = async <Selection extends SelectedFields>(options: CountOptions<Selection> = {}) => {
		const { tx = mysql, fields, where } = options

		const query = tx
			.select({
				count: drizzleCount(),
				...fields,
			})
			.from(table)
			.$withCache()
			.$dynamic()

		if (where) query.where(where)

		const rows = await query

		return rows[0] as Awaited<ReturnType<typeof query.execute>>[number]
	}

	const exists = async (options: ExistsOptions): Promise<boolean> => {
		const { tx = mysql, where } = options

		const query = tx
			.select({ one: sql.raw("1") })
			.from(table)
			.$withCache()
			.$dynamic()
			.limit(1)

		if (where) query.where(where)

		const rows = await query

		return rows.length > 0
	}

	const findOne = async <Selection extends SelectedFields = Columns<Table>>(options: FindOneOptions<Table, Selection> = {}) => {
		const { tx = mysql, fields, where } = options

		const query = tx
			.select(fields as Selection)
			.from(table)
			.$withCache()
			.$dynamic()

		if (where) query.where(where)

		query.limit(1)

		const rows = await query

		return rows.at(0) as Awaited<ReturnType<typeof query.execute>>[number] | undefined
	}

	const findMany = <Selection extends SelectedFields = Columns<Table>>(options: FindManyOptions<Table, Selection> = {}) => {
		const { tx = mysql, fields, where, orderBy, groupBy, limit, offset } = options

		const query = tx
			.select(fields as Selection)
			.from(table)
			.$withCache()
			.$dynamic()

		if (where) query.where(where)

		query.orderBy(...cast(orderBy ?? defaultOrderBy?.findMany))

		if (groupBy) query.groupBy(...cast(groupBy))
		if (limit) query.limit(limit)
		if (offset) query.offset(offset)

		return query
	}

	const findManyPaginated = async <Selection extends SelectedFields = Columns<Table>>(options: FindManyPaginatedOptions<Table, Selection> = {}) => {
		const { tx, page: pageOpt = 1, fields, where, orderBy } = options

		const total = await count({ tx, where })

		const {
			page,
			totalCount,
			totalPages,
			outOfRange,
			limit,
			offset,
		} = getPaginationMeta(pageOpt, PAGINATION_PER_PAGE, total.count)

		const pagination = {
			page,
			totalCount,
			totalPages,
		}

		if (outOfRange) {
			return {
				rows: [] as typeof rows,
				pagination,
			}
		}

		const rows = await findMany({
			tx,
			fields,
			where,
			orderBy,
			limit,
			offset,
		})

		return {
			rows,
			pagination,
		}
	}

	return {
		create,
		update,
		bulkUpdate,
		upsert,
		remove,
		count,
		exists,
		findOne,
		findMany,
		findManyPaginated,
		...table,
	} as const
}