import { z } from "zod";

export const propertyTypeSchema = z.object({
  name: z.string().min(1, "Nhập tên loại bất động sản").max(100, "Tối đa 100 ký tự"),
});

export type PropertyTypeInput = z.infer<typeof propertyTypeSchema>;
