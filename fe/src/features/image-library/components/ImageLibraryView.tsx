import { Text } from "@mantine/core";
import { ImageLibraryGrid } from "./ImageLibraryGrid";

export function ImageLibraryView() {
  return (
    <div>
      <Text
        component="h1"
        mb={8}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Thư viện ảnh
      </Text>
      <Text mb={32} maw={672} fz="sm" c="var(--color-text-muted)">
        Quản lý ảnh cá nhân của bạn — tải lên, đổi tên, xoá. Ảnh trong thư viện có thể dùng lại cho
        nhiều tin đăng khi chọn ảnh chính/ảnh phụ.
      </Text>
      <ImageLibraryGrid manageable />
    </div>
  );
}
