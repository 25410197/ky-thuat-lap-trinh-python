import { Text } from "@mantine/core";
import { RentalPostForm } from "./RentalPostForm";

export function EditRentalPostView({ postId }: { postId: string }) {
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
        Chỉnh sửa tin đăng
      </Text>
      <Text mb={40} maw={672} fz="sm" c="var(--color-text-muted)">
        Cập nhật thông tin và hình ảnh cho tin đăng của bạn. Nếu tin đang ở trạng thái đã đăng, tin
        sẽ chuyển về chờ quản trị viên duyệt lại sau khi lưu.
      </Text>
      <RentalPostForm postId={postId} />
    </div>
  );
}
