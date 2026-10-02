"use client"

import type {
	UseFormActionOptions,
	ActionClientReturn,
	FormErrors,
	SetFormError,
	SetFormValue,
	FormRefs,
	GetFormValue,
	FormValues,
	SubscribeFormField,
	FormControl,
	UseFormWatchOptions,
	UseFormFieldReturn,
	EmitChangeSubscribers,
	UseFormFieldOptions,
	FormSuccessResult,
	ExecuteFormResult,
} from "./types"

import { useCallback, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react"

import { FORM_EMPTY_ERRORS } from "./constants"

export const useFormAction = <Action extends ActionClientReturn>(options: UseFormActionOptions<Action>) => {
	const {
		action,
		initialValues,
		resetAfterAction,
	} = options

	const refs = useRef<FormRefs<Action>>({})
	const initialValuesRef = useRef({ ...initialValues })
	const valuesRef = useRef({ ...initialValues })
	const listenersRef = useRef<Set<() => void>>(new Set())

	const [errors, setErrors] = useState<FormErrors<Action>>(FORM_EMPTY_ERRORS)
	const [pending, startTransition] = useTransition()

	const subscribe = useCallback<SubscribeFormField>((callback) => {
		listenersRef.current.add(callback)

		return () => {
			listenersRef.current.delete(callback)
		}
	}, [])

	const emitChangeSubscribers = useCallback<EmitChangeSubscribers>(() => {
		for (const listener of listenersRef.current) {
			listener()
		}
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

	const setValue = useCallback<SetFormValue<Action>>((field, value) => {
		const prevValue = valuesRef.current[field]

		valuesRef.current = {
			...valuesRef.current,
			[field]: value instanceof Function
				? value(prevValue)
				: value
		}

		setError(field)
		emitChangeSubscribers()
	}, [emitChangeSubscribers, setError])

	const execute = () => {
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
					} else if (errors !== FORM_EMPTY_ERRORS) {
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
	}

	const reset = () => {
		const initialValues = { ...initialValuesRef.current }

		if (errors !== FORM_EMPTY_ERRORS) {
			setErrors(FORM_EMPTY_ERRORS)
		}

		valuesRef.current = initialValues

		for (const key in refs.current) {
			const element = refs.current[key]

			if (element && "value" in element) {
				element.value = initialValues[key] as string
			}
		}

		emitChangeSubscribers()
	}

	const control = useMemo<FormControl<Action>>(() => ({
		subscribe,
		getValue,
		setValue,
	}), [
		subscribe,
		getValue,
		setValue,
	])

	return {
		errors,
		setError,
		initialValues,
		getValue,
		setValue,
		execute,
		pending,
		reset,
		control,
	}
}

export const useFormWatch = <Action extends ActionClientReturn, Field extends keyof FormValues<Action>>(control: FormControl<Action>, options: UseFormWatchOptions<Action, Field>): FormValues<Action>[Field] => {
	const { subscribe, getValue } = control
	const { field } = options

	const getSnapshot = useCallback(() => getValue(field), [field, getValue])

	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export const useFormField = <Action extends ActionClientReturn, Field extends keyof FormValues<Action>>(control: FormControl<Action>, options: UseFormFieldOptions<Action, Field>): UseFormFieldReturn<Action, Field> => {
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