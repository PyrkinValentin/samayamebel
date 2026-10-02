import type { ReactNode } from "react"
import type { ActionClientReturn, FormControl, FormValues, FormField } from "./types"

export type FormActionProviderProps<Action extends ActionClientReturn> = {
	control: FormControl<Action>
	children?: ReactNode
}

export type FormActionFieldProps<Action extends ActionClientReturn, Field extends keyof FormValues<Action>> = {
	control: FormControl<Action>
	name: Field
	render: (field: FormField<Action, Field>) => ReactNode
}