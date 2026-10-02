"use client"

import type { ReactNode } from "react"

import { useRef } from "react"
import { useElementHeight, useScrollDirectionState } from "./hooks"

import { classNames } from "@cora-ui/react/utils"

type HeaderWrapperProps = {
	children: ReactNode
}

export const HeaderWrapper = (props: HeaderWrapperProps) => {
	const { children } = props

	const ref = useRef<HTMLElement>(null)
	const height = useElementHeight(ref, 62)
	const directionState = useScrollDirectionState(height, 5)

	return (
		<div
			className={
				classNames(
					"z-20 sticky top-0 w-full border-b bg-background transition duration-300 motion-reduce:transition-none",
					directionState.visible
						? "translate-y-0"
						: "-translate-y-[calc(100%+1px)]",
					directionState.pinned && directionState.visible
						? "border-b-separator"
						: "border-b-transparent",
				)
			}
		>
			<header
				ref={ref}
				className="mx-auto px-4 max-w-7xl h-15.5 flex items-center"
			>
				{children}
			</header>
		</div>
	)
}