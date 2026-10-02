import type { z } from "@/libs/zod"

export type ZodUnknown = z.ZodUnknown
export type ZodType<Output = unknown> = z.ZodType<Output>
export type ZodInfer<Schema extends ZodType> = z.infer<Schema>
export type ZodInput<Schema extends ZodType> = z.input<Schema>

export type UnwrapKey<T, K extends keyof T> = T extends Record<K, infer U> ? U : never
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
export type ValidationErrors<Schema extends ZodType> = Partial<Record<keyof ZodInfer<Schema>, string[]>>

export type ActionClientOptions<
	InputSchema extends ZodType,
	OutputSchema extends ZodType,
	Context extends object,
> = {
	inputSchema: InputSchema
	outputSchema: OutputSchema
	context: Context
	middlewares: Middleware<ZodType, object, object>[]
	inputMiddlewares: InputMiddleware<ZodType, object, object>[]
}

export type Middleware<
	InputSchema extends ZodType,
	Context extends object,
	NextContext extends object,
> = {
	(options: MiddlewareOptions<InputSchema, Context>): Promise<MiddlewareResult<NextContext>>
}

export type MiddlewareOptions<
	InputSchema extends ZodType,
	Context extends object,
> = {
	rawInput: ZodInput<InputSchema>
	context: Prettify<Context>
	next: {
		<NextContext extends object = object>(
			options?: MiddlewareNextOptions<NextContext>
		): Promise<MiddlewareResult<Context & NextContext>>
	}
}

export type InputMiddleware<
	InputSchema extends ZodType,
	Context extends object,
	NextContext extends object,
> = {
	(options: InputMiddlewareOptions<InputSchema, Context>): Promise<MiddlewareResult<NextContext>>
}

export type InputMiddlewareOptions<
	InputSchema extends ZodType,
	Context extends object,
> = {
	rawInput: ZodInput<InputSchema>
	inferInput: ZodInfer<InputSchema>
	context: Prettify<Context>
	next: {
		<NextContext extends object = object>(
			options?: MiddlewareNextOptions<NextContext>
		): Promise<MiddlewareResult<Context & NextContext>>
	}
}

type MiddlewareNextOptions<
	Context extends object,
> = {
	context?: Prettify<Context>
}

export type MiddlewareResult<NextContext extends object> = {
	context: Prettify<NextContext>
}

export type Handler<
	InputSchema extends ZodType,
	OutputSchema extends ZodType,
	Context extends object,
	Data,
> = (options: HandlerOptions<InputSchema, Context>) => Promise<OutputSchema extends ZodUnknown
	? Data
	: ZodInfer<OutputSchema>>

type HandlerOptions<
	InputSchema extends ZodType,
	Context extends object,
> = {
	rawInput: ZodInput<InputSchema>
	inferInput: ZodInfer<InputSchema>
	context: Prettify<Context>
}

export type ActionClientReturn<
	InputSchema extends ZodType = ZodType,
	OutputSchema extends ZodType = ZodType,
	Data = unknown,
> = (rawInput: ZodInput<InputSchema>) => Promise<ActionResult<InputSchema, OutputSchema, Data>>

type ActionResult<
	InputSchema extends ZodType,
	OutputSchema extends ZodType,
	Data,
> = ActionSuccessResult<OutputSchema, Data> | ActionErrorResult<InputSchema>

type ActionSuccessResult<
	OutputSchema extends ZodType,
	Data,
> = {
	data: OutputSchema extends ZodUnknown
		? Data
		: ZodInfer<OutputSchema>
	error: never
}

type ActionErrorResult<InputSchema extends ZodType> = {
	data: never
	error: {
		server: string
		validation?: never
	}
} | {
	data: never
	error: {
		server?: never
		validation: ValidationErrors<InputSchema>
	}
}

export type ExecuteMiddlewareStackOptions<
	InputSchema extends ZodType,
	Context extends object,
> = {
	rawInput: ZodInput<InputSchema>,
	inferInput?: ZodInfer<InputSchema>
	middlewares: Middleware<ZodType, object, object>[] | InputMiddleware<ZodType, object, object>[]
	initialContext: Context
}

export type FormErrors<Action extends ActionClientReturn> = ValidationErrors<ZodType<FormValues<Action>>> & {
	root?: string
}
export type FormValues<Action extends ActionClientReturn> = Prettify<Parameters<Action>[number]>

export type UseFormActionOptions<Action extends ActionClientReturn> = {
	action: Action
	initialValues: FormValues<Action>
	resetAfterAction?: boolean
}

export type FormErrorResult<
	Action extends ActionClientReturn
> = UnwrapKey<ActionErrorResult<ZodType<FormValues<Action>>> & { data: never }, "error">

export type FormSuccessResult<Action extends ActionClientReturn> =
	UnwrapKey<Awaited<ReturnType<Action>> & { error: never }, "data">

export type WatchSubscribeFormField<Action extends ActionClientReturn> = <Field extends keyof FormValues<Action>>(
	field: Field,
	callback: (value: FormValues<Action>[Field]) => void
) => () => void

export type EmitChangeWatchSubscribers<Action extends ActionClientReturn> = (field?: keyof FormValues<Action>) => void

export type SetFormError<
	Action extends ActionClientReturn
> = <Field extends keyof FormValues<Action> | "root">(field: Field, message?: string) => void

export type GetFormValue<
	Action extends ActionClientReturn
> = {
	(): FormValues<Action>
	<Fields extends (keyof FormValues<Action>)[]>(fields: Fields): { [P in Fields[number]]: FormValues<Action>[P] }
	<Field extends keyof FormValues<Action>>(field: Field): FormValues<Action>[Field]
}

export type SetFormValue<Action extends ActionClientReturn> = {
	<Field extends keyof FormValues<Action>>(
		field: Field,
		value: FormValues<Action>[Field] | ((prev: FormValues<Action>[Field]) => FormValues<Action>[Field])
	): void
	(values: Partial<FormValues<Action>>): void
}

export type ResetFormField<
	Action extends ActionClientReturn
> = <Field extends keyof FormValues<Action>>(field: Field) => void

export type ExecuteForm<
	Action extends ActionClientReturn
> = () => Promise<ExecuteFormResult<Action>>

export type FormControl<Action extends ActionClientReturn> = {
	watchSubscribe: WatchSubscribeFormField<Action>
	getValue: GetFormValue<Action>
	setValue: SetFormValue<Action>
}

export type FormMethods<Action extends ActionClientReturn> = {
	pending: boolean
	initialValues: FormValues<Action>
	control: FormControl<Action>
	errors: FormErrors<Action>
	setError: SetFormError<Action>
	getValue: GetFormValue<Action>
	setValue: SetFormValue<Action>
	execute: ExecuteForm<Action>
	watchField: WatchSubscribeFormField<Action>
	resetField: ResetFormField<Action>
	reset: () => void
}

export type FormField<Action extends ActionClientReturn, Field extends keyof FormValues<Action>> = {
	name: Field
	value: FormValues<Action>[Field]
	onValueChange: (value: FormValues<Action>[Field]) => void
}

export type ExecuteFormResult<Action extends ActionClientReturn> =
	| {
	data: FormSuccessResult<Action>
	error?: never
}
	| {
	data?: never
	error: FormErrorResult<Action>
}

export type UseFormWatchOptions<Action extends ActionClientReturn, Field extends keyof FormValues<Action>> = {
	field: Field
}

export type UseFormFieldOptions<Action extends ActionClientReturn, Field extends keyof FormValues<Action>> = {
	field: Field
}