import { z } from "zod";

export const rsvpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(60),
  attending: z.boolean(),
  guests: z.coerce.number().int().min(0).max(3),
  message: z
    .string()
    .trim()
    .max(500, "O recado pode ter no maximo 500 caracteres.")
    .optional()
    .transform((value) => (value === "" ? undefined : value)),
});

export const guestbookSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(40),
  message: z.string().trim().min(3, "Escreva um recado maior.").max(240),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
export type RsvpFormInput = z.input<typeof rsvpSchema>;
export type GuestbookInput = z.infer<typeof guestbookSchema>;
