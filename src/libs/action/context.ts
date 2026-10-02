"use client"

import type { ActionClientReturn, FormControl } from "./types"

import { createContext } from "react"

export type FormActionContextValue<Action extends ActionClientReturn> = {
	control: FormControl<Action>
}

export const FormActionContext = createContext({} as FormActionContextValue<ActionClientReturn>)