import { z } from "zod";
import { UserRole } from "@prisma/client";

export const manualLoginSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, "Name is required").optional(),
  role: z.nativeEnum(UserRole)
});

