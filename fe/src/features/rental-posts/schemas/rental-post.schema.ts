import { z } from "zod";

// Khớp đúng các trường trong màn hình Figma "Đăng tin cho thuê - Phong cách Cổ điển".
export const rentalPostSchema = z.object({
  title: z.string().min(1, "Nhập tiêu đề tin đăng").max(99, "Tối đa 99 ký tự"),
  propertyType: z.string().min(1, "Chọn loại bất động sản"),
  areaM2: z.number({ error: "Nhập diện tích" }).positive("Diện tích phải lớn hơn 0"),
  priceVnd: z.number({ error: "Nhập mức giá" }).positive("Giá thuê phải lớn hơn 0"),
  province: z.string().min(1, "Chọn tỉnh/thành"),
  ward: z.string().min(1, "Chọn phường/xã"),
  address: z.string().min(1, "Nhập địa chỉ chi tiết"),
  description: z.string().min(30, "Mô tả tối thiểu 30 ký tự"),
  images: z.array(z.string()).min(1, "Vui lòng tải lên ít nhất 1 hình ảnh"),
  bedrooms: z.number().min(0, "Số phòng ngủ không hợp lệ"),
  bathrooms: z.number().min(0, "Số phòng tắm không hợp lệ"),
  amenities: z.array(z.string()).default([]),
  contactName: z.string().min(1, "Nhập tên người liên hệ"),
  contactPhone: z.string().min(9, "Số điện thoại không hợp lệ"),
  contactMethod: z.enum(["call", "zalo"]).default("call"),
});

export type RentalPostInput = z.infer<typeof rentalPostSchema>;
