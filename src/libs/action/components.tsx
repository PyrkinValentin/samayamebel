"use client"

import type { FormActionFieldProps, FormActionProviderProps } from "./props"
import type { ActionClientReturn, FormValues } from "./types"

import { useMemo } from "react"

import { useFormField } from "./hooks"
import { FormActionContext, FormActionContextValue } from "./context"

export const FormActionProvider = <Action extends ActionClientReturn>(props: FormActionProviderProps<Action>) => {
	const { control, children } = props

	const contextValue = useMemo<FormActionContextValue<Action>>(() => ({
		control,
	}), [control])

	return (
		<FormActionContext value={contextValue}>
			{children}
		</FormActionContext>
	)
}

export const FormActionField = <Action extends ActionClientReturn, Field extends keyof FormValues<Action>>(props: FormActionFieldProps<Action, Field>) => {
	const {
		control,
		name,
		render,
	} = props

	const field = useFormField(control, { field: name })

	return render(field)
}