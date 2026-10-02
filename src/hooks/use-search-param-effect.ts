"use client"

import type { ReadonlyURLSearchParams } from "next/navigation"

import { useSearchParams } from "next/navigation"
import { useEffect, useEffectEvent } from "react"

type Handler = (searchParams: ReadonlyURLSearchParams) => (() => void) | void

export const useSearchParamEffect = (param: string, handler: Handler) => {
	const searchParams = useSearchParams()
	const effectHandler = useEffectEvent(handler)

	useEffect(() => {
		if (searchParams.has(param)) {
			const cleanup = effectHandler(searchParams)

			return () => {
				cleanup?.()
			}
		}
	}, [param, searchParams])
}