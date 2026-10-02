import type { ActionClientOptions, Handler, InputMiddleware, Middleware, Prettify, ZodType } from "./types"

import { z } from "@/libs/zod"
import { actionBuilder } from "./utils"

class ActionClient<
	InputSchema extends ZodType,
	OutputSchema extends ZodType,
	Context extends object,
> {
	readonly #options: ActionClientOptions<InputSchema, OutputSchema, Context>

	constructor(options: ActionClientOptions<InputSchema, OutputSchema, Context>) {
		this.#options = options
	}

	use<NextContext extends object>(
		this: ActionClient<InputSchema, OutputSchema, Context>,
		middleware: Middleware<InputSchema, Context, NextContext>
	) {
		return new ActionClient<InputSchema, OutputSchema, NextContext>({
			...this.#options,
			middlewares: [
				...this.#options.middlewares,
				middleware as Middleware<ZodType, object, object>
			],
			context: {} as Prettify<NextContext>,
		})
	}

	useInput<NextContext extends object>(
		this: ActionClient<InputSchema, OutputSchema, Context>,
		middleware: InputMiddleware<InputSchema, Context, NextContext>
	) {
		return new ActionClient<InputSchema, OutputSchema, NextContext>({
			...this.#options,
			inputMiddlewares: [
				...this.#options.inputMiddlewares,
				middleware as InputMiddleware<ZodType, object, object>
			],
			context: {} as Prettify<NextContext>,
		})
	}

	inputSchema<NextInputSchema extends ZodType>(
		this: ActionClient<InputSchema, OutputSchema, Context>,
		inputSchema: NextInputSchema
	) {
		return new ActionClient<NextInputSchema, OutputSchema, Context>({
			...this.#options,
			inputSchema,
		})
	}

	outputSchema<NextOutputSchema extends ZodType>(
		this: ActionClient<InputSchema, OutputSchema, Context>,
		outputSchema: NextOutputSchema
	) {
		return new ActionClient<InputSchema, NextOutputSchema, Context>({
			...this.#options,
			outputSchema,
		})
	}

	action<Data>(
		this: ActionClient<InputSchema, OutputSchema, Context>,
		handler: Handler<InputSchema, OutputSchema, Context, Data>,
	) {
		return actionBuilder(this.#options, handler)
	}
}

export const createActionClient = () => new ActionClient({
	inputSchema: z.unknown(),
	outputSchema: z.unknown(),
	context: {},
	middlewares: [],
	inputMiddlewares: [],
})