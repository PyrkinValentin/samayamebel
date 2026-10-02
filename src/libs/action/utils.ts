import type {
	ActionClientReturn,
	ActionClientOptions,
	Handler,
	MiddlewareOptions,
	MiddlewareResult,
	Prettify,
	ValidationErrors,
	ZodType,
	ZodUnknown,
	ZodInfer,
	ExecuteMiddlewareStackOptions,
	InputMiddlewareOptions,
} from "./types"

import { z } from "@/libs/zod"

export const actionBuilder = <
	InputSchema extends ZodType,
	OutputSchema extends ZodType,
	Context extends object,
	Data,
>(options: ActionClientOptions<InputSchema, OutputSchema, Context>, handler: Handler<InputSchema, OutputSchema, Context, Data>): ActionClientReturn<InputSchema, OutputSchema, Data> => {
	return async (rawInput) => {
		try {
			const middlewareResult = await executeMiddlewareStack({
				rawInput,
				middlewares: options.middlewares,
				initialContext: options.context,
			})

			const { error, data: inferInput } = z.safeParse(options.inputSchema, rawInput)

			if (error) {
				const { fieldErrors } = z.flattenError(error)

				returnValidationErrors(
					options.inputSchema,
					fieldErrors,
				)
			}

			const inputMiddlewareResult = await executeMiddlewareStack({
				rawInput,
				inferInput,
				middlewares: options.inputMiddlewares,
				initialContext: middlewareResult.context,
			})

			const executionResult = await handler({
				rawInput,
				inferInput,
				context: {
					...middlewareResult.context,
					...inputMiddlewareResult.context,
				},
			})

			if (options.outputSchema) {
				const { error, data } = z.safeParse(options.outputSchema, executionResult)

				if (error) {
					returnServerError("Invalid action data (output). Please be sure to return data following the shape of the schema passed to `dataSchema` method.")
				}

				return {
					error: undefined as never,
					data: data as OutputSchema extends ZodUnknown
						? Data
						: ZodInfer<OutputSchema>,
				}
			}

			return {
				error: undefined as never,
				data: executionResult,
			}
		} catch (error) {
			if (error instanceof ActionValidationErrors) {
				return {
					error: {
						validation: error.validation,
					},
					data: undefined as never,
				}
			}

			if (error instanceof ActionServerError) {
				return {
					error: {
						server: error.server,
					},
					data: undefined as never,
				}
			}

			throw error
		}
	}
}

const executeMiddlewareStack = async <
	InputSchema extends ZodType,
	Context extends object,
>(options: ExecuteMiddlewareStackOptions<InputSchema, Context>) => {
	const {
		rawInput,
		inferInput,
		middlewares,
		initialContext,
	} = options

	const run = async (
		idx: number,
		context: Context,
	): Promise<MiddlewareResult<Context>> => {
		const currentMiddleware = middlewares.at(idx)

		if (!currentMiddleware) {
			return { context }
		}

		return await currentMiddleware({
			rawInput,
			inferInput,
			context,
			next: (async (options) => {
				return await run(idx + 1, {
					...context,
					...options?.context,
				}) as never
			}),
		}) as MiddlewareResult<Context>
	}

	return await run(0, initialContext)
}

export const createMiddleware = <
	InputSchema extends ZodType,
	NewContext extends object
>(
	handler: <Context extends object>(
		options: MiddlewareOptions<InputSchema, Context> | InputMiddlewareOptions<InputSchema, Context>
	) => Promise<MiddlewareResult<Context> & MiddlewareResult<Prettify<NewContext>>>
) => handler

class ActionValidationErrors<Schema extends ZodType> extends Error {
	public validation: ValidationErrors<Schema>

	constructor(errors: ValidationErrors<Schema>, overriddenErrorMessage?: string) {
		super(overriddenErrorMessage ?? "Server Action validation error(s) occurred")
		this.validation = errors
	}
}

class ActionServerError extends Error {
	public server: string

	constructor(error: string, overriddenErrorMessage?: string) {
		super(overriddenErrorMessage ?? "Server Action error occurred")
		this.server = error
	}
}

export function returnValidationErrors<
	Schema extends ZodType,
>(_: Schema, validationErrors: ValidationErrors<Schema>): never {
	throw new ActionValidationErrors<Schema>(validationErrors)
}

export function returnServerError(message: string): never {
	throw new ActionServerError(message)
}