import slugify from "slugify"

export const toSlug = (text: string) => {
	const trimmedText = text.trim()

	if (!trimmedText) return ""

	return slugify(trimmedText, {
		lower: true,
		strict: true,
		trim: true,
		locale: "ru",
	})
}