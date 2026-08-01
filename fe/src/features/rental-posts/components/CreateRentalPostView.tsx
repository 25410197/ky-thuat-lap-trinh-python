import { Group, Text } from "@mantine/core";
import { RentalPostForm } from "./RentalPostForm";

export function CreateRentalPostView() {
  return (
    <div>
      <Group gap={12} mb={8}>
        <Text
          component="h1"
          fz={30}
          fw={700}
          c="var(--color-brand)"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Đăng tin cho thuê
        </Text>
        <Text
          component="span"
          px={12}
          py={4}
          fz={11}
          fw={700}
          tt="uppercase"
          c="var(--color-brand-muted)"
          bg="var(--color-surface-muted)"
          style={{ borderRadius: 9999, letterSpacing: "0.05em" }}
        >
          Bản nháp được lưu tự động
        </Text>
      </Group>
      <Text mb={40} maw={672} fz="sm" c="var(--color-text-muted)">
        Cung cấp thông tin chi tiết và hình ảnh chất lượng cao để tài sản của bạn tiếp cận được
        với những khách hàng cao cấp và tiềm năng nhất.
      </Text>
      <RentalPostForm />
    </div>
  );
}
