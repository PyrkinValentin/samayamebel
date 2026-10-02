import { z } from "@/libs/zod"

export const schema = {
	uuid: z.uuid("Неверный формат идентификатора"),
} as const