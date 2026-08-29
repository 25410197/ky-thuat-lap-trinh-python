import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().max(20, "Số điện thoại tối đa 20 ký tự").optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
