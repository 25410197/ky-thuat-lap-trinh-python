"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Button, Checkbox, Group, Modal, Skeleton, Text, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { baoCaoApi } from "@/lib/api/bao-cao";
import type { BaoCaoChiTiet } from "@/schemas/bao-cao";
import { formatDateVi } from "@/lib/utils";
import { IconCheck, IconX, IconBan } from "@tabler/icons-react";
import Link from "next/link";

const STATUS_COLOR: Record<string, string> = {
  cho_xu_ly: "orange",
  da_xu_ly: "green",
  tu_choi: "red",
};

const STATUS_LABEL: Record<string, string> = {
  cho_xu_ly: "Chờ xử lý",
  da_xu_ly: "Đã xử lý",
  tu_choi: "Đã từ chối",
};

export function AdminReportDetailView({ id }: { id: number }) {
  const [data, setData] = useState<BaoCaoChiTiet | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpened, setModalOpened] = useState(false);
  const [actionType, setActionType] = useState<"RESOLVED" | "REJECTED" | null>(null);
  const [note, setNote] = useState("");
  const [blockPost, setBlockPost] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    baoCaoApi.getDetail(id)
      .then(setData)
      .catch(() => notifications.show({ color: "red", message: "Không thể tải chi tiết báo cáo" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const openActionModal = (type: "RESOLVED" | "REJECTED") => {
    setActionType(type);
    setNote("");
    setBlockPost(false);
    setBlockReason("");
    setModalOpened(true);
  };

  const handleSubmit = async () => {
    if (!actionType) return;
    if (blockPost && !blockReason.trim()) {
      notifications.show({ color: "red", message: "Vui lòng nhập lý do khóa tin." });
      return;
    }

    setSubmitting(true);
    try {
      await baoCaoApi.process(id, {
        action: actionType,
        ghiChuXuLy: note,
        khoaTin: blockPost,
        lyDoKhoa: blockReason || null,
      });
      notifications.show({ color: "green", message: "Xử lý báo cáo thành công!" });
      setModalOpened(false);
      load();
    } catch (e: any) {
      notifications.show({ color: "red", message: e.message || "Có lỗi xảy ra" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box p={24}><Skeleton height={400} radius="md" /></Box>;
  }

  if (!data) return <Box p={24}>Không tìm thấy báo cáo</Box>;

  return (
    <Box
      bg="var(--color-surface)"
      style={{
        borderRadius: "var(--radius-card)",
        border: "1px solid var(--color-border)",
        boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
      }}
    >
      <Group justify="space-between" p={24} style={{ borderBottom: "1px solid var(--color-border)" }}>
        <Box>
          <Text fz="xl" fw={700} c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
            Chi tiết báo cáo #{data.id}
          </Text>
          <Badge mt={8} variant="light" color={STATUS_COLOR[data.trangThai]} radius="sm">
            {STATUS_LABEL[data.trangThai] || data.trangThai}
          </Badge>
        </Box>
        {data.trangThai === "cho_xu_ly" && (
          <Group>
            <Button
              color="green"
              leftSection={<IconCheck size={18} />}
              onClick={() => openActionModal("RESOLVED")}
            >
              Đánh dấu Đã xử lý
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconX size={18} />}
              onClick={() => openActionModal("REJECTED")}
            >
              Từ chối báo cáo
            </Button>
          </Group>
        )}
      </Group>

      <Box p={24}>
        <Group align="flex-start" grow>
          <Box>
            <Text fw={600} mb={8} c="dimmed">Thông tin báo cáo</Text>
            <Text size="sm"><b>Người gửi:</b> {data.nguoiBaoCao.hoTen} ({data.nguoiBaoCao.email})</Text>
            <Text size="sm"><b>Ngày gửi:</b> {formatDateVi(data.ngayBaoCao)}</Text>
            <Text size="sm" mt={8}><b>Lý do:</b> {data.lyDo}</Text>
            {data.moTa && <Text size="sm"><b>Mô tả thêm:</b> {data.moTa}</Text>}
          </Box>
          <Box>
            <Text fw={600} mb={8} c="dimmed">Tin đăng bị báo cáo</Text>
            <Text size="sm"><b>ID:</b> {data.tinDang.id}</Text>
            <Text size="sm"><b>Tiêu đề:</b> {data.tinDang.tieuDe}</Text>
            <Button
              component={Link}
              href={`/cho-thue/${data.tinDang.id}`}
              target="_blank"
              variant="light"
              size="xs"
              mt={8}
            >
              Xem trang tin đăng
            </Button>
          </Box>
        </Group>

        {data.trangThai !== "cho_xu_ly" && (
          <Box mt={32} p={16} bg="gray.0" style={{ borderRadius: "var(--radius-md)" }}>
            <Text fw={600} mb={8}>Kết quả xử lý</Text>
            <Text size="sm"><b>Người xử lý:</b> {data.nguoiXuLy?.hoTen || "Không rõ"}</Text>
            <Text size="sm"><b>Thời gian:</b> {data.ngayXuLy ? formatDateVi(data.ngayXuLy) : "Không rõ"}</Text>
            <Text size="sm" mt={8}><b>Ghi chú:</b> {data.ghiChuXuLy || "Không có ghi chú"}</Text>
          </Box>
        )}
      </Box>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={<Text fw={600}>{actionType === "RESOLVED" ? "Đánh dấu Đã xử lý báo cáo" : "Từ chối báo cáo"}</Text>}
      >
        <Textarea
          label="Ghi chú xử lý"
          placeholder="Nhập ghi chú cho hành động này..."
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
          minRows={3}
          data-autofocus
        />

        {actionType === "RESOLVED" && (
          <Box mt={16}>
            <Checkbox
              label="Khóa tin đăng này ngay lập tức"
              checked={blockPost}
              onChange={(e) => setBlockPost(e.currentTarget.checked)}
              color="red"
            />
            {blockPost && (
              <TextInput
                mt={8}
                label="Lý do khóa tin"
                placeholder="Ví dụ: Tin đăng sai sự thật..."
                required
                value={blockReason}
                onChange={(e) => setBlockReason(e.currentTarget.value)}
              />
            )}
          </Box>
        )}

        <Group justify="flex-end" mt={24}>
          <Button variant="default" onClick={() => setModalOpened(false)}>Hủy</Button>
          <Button
            color={actionType === "RESOLVED" ? "green" : "red"}
            loading={submitting}
            onClick={handleSubmit}
          >
            Xác nhận {actionType === "RESOLVED" ? "Đã xử lý" : "Từ chối"}
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}
