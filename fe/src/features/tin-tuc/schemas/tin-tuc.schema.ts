import { z } from "zod";

export const newsFormSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề").max(200, "Tiêu đề tối đa 200 ký tự"),
  slug: z.string().max(220, "Slug tối đa 220 ký tự").optional().or(z.literal("")),
  excerpt: z.string().min(1, "Vui lòng nhập tóm tắt").max(200, "Tóm tắt tối đa 200 ký tự"),
  contentHtml: z.string().min(1, "Vui lòng soạn nội dung bài viết"),
});

export type NewsFormInput = z.infer<typeof newsFormSchema>;
