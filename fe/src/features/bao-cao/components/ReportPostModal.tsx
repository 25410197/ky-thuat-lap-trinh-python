"use client";

import { useState } from "react";
import { Modal, Select, Textarea, Button, Group, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { baoCaoApi } from "@/lib/api/bao-cao";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";

interface ReportPostModalProps {
  opened: boolean;
  onClose: () => void;
  tinDangId: string | number;
  tieuDe: string;
}

const REPORT_REASONS = [
  "Thông tin không chính xác",
  "Tin đăng trùng lặp",
  "Có dấu hiệu lừa đảo",
  "Giá không hợp lý",
  "Nội dung không phù hợp",
  "Khác",
];

export function ReportPostModal({ opened, onClose, tinDangId, tieuDe }: ReportPostModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      lyDo: "",
      moTa: "",
    },
    validate: {
      lyDo: (value) => (value ? null : "Vui lòng chọn lý do báo cáo"),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      await baoCaoApi.submitReport(tinDangId, {
        lyDo: values.lyDo,
        moTa: values.moTa,
      });

      notifications.show({
        title: "Thành công",
        message: "Báo cáo của bạn đã được gửi và đang chờ xử lý.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      
      form.reset();
      onClose();
    } catch (error: any) {
      notifications.show({
        title: "Lỗi",
        message: error.response?.data?.detail || "Không thể gửi báo cáo. Vui lòng thử lại sau.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (!loading) onClose();
      }}
      title={
        <Group gap="xs">
          <IconAlertTriangle size={20} color="var(--mantine-color-red-6)" />
          <Text fw={600}>Báo cáo tin đăng</Text>
        </Group>
      }
      size="md"
    >
      <Text size="sm" c="dimmed" mb="md">
        Bạn đang báo cáo tin đăng: <Text span fw={600} c="dark">{tieuDe}</Text>
      </Text>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Select
          label="Lý do báo cáo"
          placeholder="Chọn lý do báo cáo"
          data={REPORT_REASONS}
          required
          mb="md"
          {...form.getInputProps("lyDo")}
        />

        <Textarea
          label="Mô tả thêm (không bắt buộc)"
          placeholder="Cung cấp thêm chi tiết giúp chúng tôi xử lý nhanh hơn..."
          minRows={3}
          mb="xl"
          {...form.getInputProps("moTa")}
        />

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" color="red" loading={loading}>
            Gửi báo cáo
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
