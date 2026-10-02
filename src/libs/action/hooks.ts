"use client"

import type {
	UseFormActionOptions,
	ActionClientReturn,
	FormErrors,
	SetFormError,
	SetFormValue,
	GetFormValue,
	FormValues,
	FormControl,
	UseFormWatchOptions,
	FormField,
	UseFormFieldOptions,
	FormSuccessResult,
	ExecuteFormResult,
	FormMethods,
	ExecuteForm,
	ResetFormField,
	WatchSubscribeFormField,
	EmitChangeWatchSubscribers,
} from "./types"

import type { FormActionContextValue } from "./context"

import { use, useCallback, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react"

import { FormActionContext } from "@/libs/action/context"

import { FORM_EMPTY_ERRORS } from "./constants"

export const useFormAction = <Action extends ActionClientReturn>(options: UseFormActionOptions<Action>): FormMethods<Action> => {
	const {
		action,
		initialValues,
		resetAfterAction,
	} = options

	const initialValuesRef = useRef({ ...initialValues })
	const valuesRef = useRef({ ...initialValues })
	const watchSubscribersRef = useRef<Map<keyof FormValues<Action>, Set<(value: never) => void>>>(new Map())

	const [errors, setErrors] = useState<FormErrors<Action>>(FORM_EMPTY_ERRORS)
	const [pending, startTransition] = useTransition()

	const hasErrors = errors !== FORM_EMPTY_ERRORS

	const watchSubscribe = useCallback<WatchSubscribeFormField<Action>>((field, callback) => {
		if (!watchSubscribersRef.current.has(field)) {
			watchSubscribersRef.current.set(field, new Set())
		}

		watchSubscribersRef.current
			.get(field)
			?.add(callback)

		callback(valuesRef.current[field] as never)

		return () => {
			const fieldSet = watchSubscribersRef.current.get(field)

			if (fieldSet) {
				fieldSet.delete(callback)

				if (fieldSet.size === 0) {
					watchSubscribersRef.current.delete(field)
				}
			}
		}
	}, [])

	const emitChangeWatchSubscribers = useCallback<EmitChangeWatchSubscribers<Action>>((field) => {
		if (field) {
			const fieldSet = watchSubscribersRef.current.get(field)
			const value = valuesRef.current[field] as never

			if (fieldSet) {
				for (const callback of fieldSet) {
					callback(value)
				}
			}

			return
		}

		watchSubscribersRef.current.forEach((fieldSet, field) => {
			const value = valuesRef.current[field] as never

			for (const callback of fieldSet) {
				callback(value)
			}
		})
	}, [])

	const setError = useCallback<SetFormError<Action>>((field, message) => {
		setErrors((prevErrors) => {
			if (message) {
				return {
					...prevErrors,
					[field]: message,
				}
			}

			if (prevErrors[field]) {
				const nextErrors = { ...prevErrors }
				delete nextErrors[field]
				return nextErrors
			}

			return prevErrors
		})
	}, [])

	const getValue = useCallback((field?: keyof FormValues<Action> | (keyof FormValues<Action>)[]) => {
		if (!field) {
			return valuesRef.current
		}

		if (Array.isArray(field)) {
			return field.reduce((acc, key) => ({
				...acc,
				[key]: valuesRef.current[key]
			}), {})
		}

		return valuesRef.current[field]
	}, []) as GetFormValue<Action>

	const setValue = useCallback((fieldOrValues, value) => {
		if (value === undefined) {
			const updateBatch = fieldOrValues as Partial<FormValues<Action>>

			valuesRef.current = {
				...valuesRef.current,
				...updateBatch,
			}

			Object
				.keys(updateBatch)
				.forEach((key) => {
					const field = key as keyof FormValues<Action>

					setError(field)
					emitChangeWatchSubscribers(field)
				})

			return
		}

		valuesRef.current = {
			...valuesRef.current,
			[fieldOrValues]: value instanceof Function
				? value(valuesRef.current[fieldOrValues])
				: value,
		}

		setError(fieldOrValues)
		emitChangeWatchSubscribers(fieldOrValues)
	}, [setError, emitChangeWatchSubscribers]) as SetFormValue<Action>

	const resetField = useCallback<ResetFormField<Action>>((field) => {
		setValue(field, initialValuesRef.current[field])
	}, [setValue])

	const reset = useCallback(() => {
		if (hasErrors) {
			setErrors(FORM_EMPTY_ERRORS)
		}

		setValue(initialValuesRef.current)
	}, [hasErrors, setValue])

	const execute = useCallback<ExecuteForm<Action>>(() => {
		return new Promise<ExecuteFormResult<Action>>((resolve) => {
			startTransition(async () => {
				try {
					const { error, data } = await action(valuesRef.current)

					if (error) {
						setErrors((prevErrors) => ({
							...prevErrors,
							...(error.validation ?? { root: error.server })
						}))

						resolve({ error })
						return
					}

					if (resetAfterAction) {
						reset()
					} else if (hasErrors) {
						setErrors(FORM_EMPTY_ERRORS)
					}

					resolve({ data: data as FormSuccessResult<Action> })
				} catch (err) {
					const rootMessage = err instanceof Error
						? err.message
						: typeof err === "string"
							? err
							: "Unknown server error occurred"

					setErrors((prevErrors) => ({
						...prevErrors,
						root: rootMessage,
					}))

					resolve({
						error: { server: rootMessage },
					})
				}
			})
		})
	}, [action, hasErrors, reset, resetAfterAction])

	const control = useMemo<FormControl<Action>>(() => ({
		watchSubscribe,
		getValue,
		setValue,
	}), [
		watchSubscribe,
		getValue,
		setValue,
	])

	return {
		pending,
		initialValues,
		control,
		errors,
		setError,
		getValue,
		setValue,
		execute,
		watchField: watchSubscribe,
		resetField,
		reset,
	}
}

export const useFormWatch = <Action extends ActionClientReturn, Field extends keyof FormValues<Action>>(control: FormControl<Action>, options: UseFormWatchOptions<Action, Field>): FormValues<Action>[Field] => {
	const { watchSubscribe, getValue } = control
	const { field } = options

	const subscribeToField = useCallback((callback: () => void) => {
		return watchSubscribe(field, callback)
	}, [watchSubscribe, field])

	const getSnapshot = useCallback(() => getValue(field), [field, getValue])

	return useSyncExternalStore(subscribeToField, getSnapshot, getSnapshot)
}

export const useFormField = <Action extends ActionClientReturn, Field extends keyof FormValues<Action>>(control: FormControl<Action>, options: UseFormFieldOptions<Action, Field>): FormField<Action, Field> => {
	const { setValue } = control
	const { field } = options

	const value = useFormWatch(control, { field })

	const onValueChange = (value: FormValues<Action>[Field]) => {
		setValue(field, value)
	}

	return {
		name: field,
		value,
		onValueChange,
	}
}

export const useFormActionContext = <Action extends ActionClientReturn>() => use<FormActionContextValue<Action>>(FormActionContext)