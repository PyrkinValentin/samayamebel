import type { mysql } from "@/libs/mysql"
import type { Placeholder, SQL } from "drizzle-orm"
import type { MySqlTable } from "drizzle-orm/mysql-core/table"
import type { MySqlRawQueryResult } from "drizzle-orm/mysql2"
import type { MySqlUpdateSetSource, SelectedFields } from "drizzle-orm/mysql-core"
import type { MySqlColumn } from "drizzle-orm/mysql-core/columns"

export type MysqlTransaction = Parameters<Parameters<typeof mysql.transaction>[0]>[0]

export type CreateServiceOptions<Table extends MySqlTable> = {
	table: Table
	defaultOrderBy?: {
		findMany?: MySqlColumn | SQL | SQL.Aliased | (MySqlColumn | SQL | SQL.Aliased)[]
	}
}

export type InferInsert<Table extends MySqlTable> = Table["$inferInsert"]
export type InferSelect<Table extends MySqlTable> = Table["$inferSelect"]
export type Columns<Table extends MySqlTable> = Table["_"]["columns"]

export type CreateOptions<Table extends MySqlTable, Values extends InferInsert<Table> | InferInsert<Table>[], ReturnId extends boolean = false> = {
	tx?: MysqlTransaction
	returnId?: ReturnId
	values: Values
}

export type CreateReturn<Table extends MySqlTable, ReturnId extends boolean = false> = ReturnId extends false
	? Promise<MySqlRawQueryResult>
	: Promise<{ id: InferSelect<Table>["id"] }[]>

export type UpdateOptions<Table extends MySqlTable> = {
	tx?: MysqlTransaction
	values: Partial<InferSelect<Table>> | Partial<InferSelect<Table>>[]
	where?: SQL
	limit?: number | Placeholder
}

export type BulkUpdateOptions<Table extends MySqlTable> = {
	tx?: MysqlTransaction
	values: (Partial<InferSelect<Table>> & { id: InferSelect<Table>["id"] })[]
	where?: SQL
	limit?: number | Placeholder
}

export type UpsertOptions<Table extends MySqlTable, ReturnId extends boolean = false> = {
	tx?: MysqlTransaction
	returnId?: ReturnId
	values: InferInsert<Table> | InferInsert<Table>[]
	set: MySqlUpdateSetSource<Table>
}

export type UpsertReturn<Table extends MySqlTable, ReturnId extends boolean = false> = ReturnId extends false
	? Promise<MySqlRawQueryResult>
	: Promise<{ id: InferSelect<Table>["id"] }[]>

export type RemoveOptions = {
	tx?: MysqlTransaction
	where?: SQL
	limit?: number | Placeholder
}

export type CountOptions<Selection extends SelectedFields> = {
	tx?: MysqlTransaction
	fields?: Selection
	where?: SQL
}

export type ExistsOptions = {
	tx?: MysqlTransaction
	where: SQL | undefined
}

export type FindOneOptions<Table extends MySqlTable, Selection extends SelectedFields = Columns<Table>> = {
	tx?: MysqlTransaction
	fields?: Selection
	where?: SQL
}

export type FindManyOptions<Table extends MySqlTable, Selection extends SelectedFields = Columns<Table>> = {
	tx?: MysqlTransaction
	fields?: Selection
	where?: SQL
	orderBy?: MySqlColumn | SQL | SQL.Aliased | (MySqlColumn | SQL | SQL.Aliased)[]
	groupBy?: MySqlColumn | SQL | SQL.Aliased | (MySqlColumn | SQL | SQL.Aliased)[]
	limit?: number | Placeholder
	offset?: number | Placeholder
}

export type FindManyPaginatedOptions<Table extends MySqlTable, Selection extends SelectedFields = Columns<Table>> =
	Omit<FindManyOptions<Table, Selection>, "limit" | "offset">
	& { page?: number }

export type PaginationMeta = {
	page: number
	offset: number
	limit: number
	totalCount: number
	totalPages: number
	outOfRange: boolean
}