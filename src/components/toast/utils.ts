import { toSlug } from "@/utils"
import { toastManager } from "./toast"

const createId = (...keys: (string | undefined)[]) => {
	return toSlug(
		keys
			.filter(Boolean)
			.join("-")
	)
}

export const toastError = (title?: string, description?: string) => toastManager.add({
	id: createId(title, description, "error"),
	status: "error",
	title: title ?? "Упс, что-то пошло не так",
	description: (title || description)
		? description
		: "Мы уже разбираемся с этим. Пожалуйста, попробуйте позже",
})

export const toastSuccess = (title: string, description?: string) => toastManager.add({
	id: createId(title, description, "success"),
	status: "success",
	title,
	description,
})

export const toastWarning = (title: string, description?: string) => toastManager.add({
	id: createId(title, description, "warning"),
	status: "warning",
	title,
	description,
})