import type { Viewport } from "next"

import "@/styles/globals.css"

import { getHeaderData } from "@/components/header"

import { Inter } from "next/font/google"
import { Toaster } from "@/components/toast"
import { Header } from "@/components/header"

export const viewport: Viewport = {
	viewportFit: "cover",
	minimumScale: 1,
	maximumScale: 1,
}

const inter = Inter({
	variable: "--font-sans",
	subsets: ["cyrillic", "cyrillic-ext", "latin"],
})

const RootLayout = async (props: LayoutProps<"/">) => {
	const { children } = props

	const headerData = await getHeaderData()

	return (
		<html
			lang="ru"
			data-scroll-behavior="smooth"
			className={inter.variable}
		>
			<body>
				<Toaster>
					<div className="root min-h-dvh flex flex-col">
						<Header {...headerData}/>

						<div className="mx-auto p-4 w-full max-w-7xl flex-1 flex flex-col">
							{children}
						</div>
					</div>
				</Toaster>
			</body>
		</html>
	)
}

export default RootLayout
