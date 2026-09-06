"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Button, Group, Modal, Skeleton, Text, Textarea, TextInput } from "@mantine/core";
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

  // Block confirm modal state (for "Đánh dấu Đã xử lý")
  const [blockModalOpened, setBlockModalOpened] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockSubmitting, setBlockSubmitting] = useState(false);

  // Reject modal state (for "Từ chối báo cáo")
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

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

  const openBlockConfirm = () => {
    setBlockReason("");
    setBlockModalOpened(true);
  };

  const openRejectModal = () => {
    setRejectNote("");
    setRejectModalOpened(true);
  };

  const handleBlockSubmit = async () => {
    if (!blockReason.trim()) {
      notifications.show({ color: "red", message: "Vui lòng nhập lý do khóa tin." });
      return;
    }

    setBlockSubmitting(true);
    try {
      await baoCaoApi.process(id, {
        action: "RESOLVED",
        ghiChuXuLy: "",
        khoaTin: true,
        lyDoKhoa: blockReason,
      });
      notifications.show({ color: "green", message: "Xử lý báo cáo và khóa tin thành công!" });
      setBlockModalOpened(false);
      load();
    } catch (e: any) {
      notifications.show({ color: "red", message: e.message || "Có lỗi xảy ra" });
    } finally {
      setBlockSubmitting(false);
    }
  };

  const handleRejectSubmit = async () => {
    setRejectSubmitting(true);
    try {
      await baoCaoApi.process(id, {
        action: "REJECTED",
        ghiChuXuLy: rejectNote,
        khoaTin: false,
        lyDoKhoa: null,
      });
      notifications.show({ color: "green", message: "Đã từ chối báo cáo!" });
      setRejectModalOpened(false);
      load();
    } catch (e: any) {
      notifications.show({ color: "red", message: e.message || "Có lỗi xảy ra" });
    } finally {
      setRejectSubmitting(false);
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
              color="red"
              leftSection={<IconBan size={18} />}
              onClick={openBlockConfirm}
            >
              Khóa tin đăng
            </Button>
            <Button
              color="red"
              variant="light"
              leftSection={<IconX size={18} />}
              onClick={openRejectModal}
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
              href={`/chi-tiet-tin-dang/${data.tinDang.id}`}
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

      {/* Block confirm modal — shown when "Đánh dấu Đã xử lý" is clicked */}
      <Modal
        opened={blockModalOpened}
        onClose={() => setBlockModalOpened(false)}
        title={<Text fw={600}>Khóa tin đăng</Text>}
      >
        <Text size="sm" c="dimmed" mb={16}>
          Báo cáo sẽ được đánh dấu đã xử lý và tin đăng sẽ bị khóa ngay lập tức.
        </Text>
        <TextInput
          label="Lý do khóa tin"
          placeholder="Ví dụ: Tin đăng sai sự thật..."
          required
          value={blockReason}
          onChange={(e) => setBlockReason(e.currentTarget.value)}
          data-autofocus
        />
        <Group justify="flex-end" mt={24}>
          <Button variant="default" onClick={() => setBlockModalOpened(false)}>Hủy</Button>
          <Button
            color="red"
            leftSection={<IconBan size={16} />}
            loading={blockSubmitting}
            onClick={handleBlockSubmit}
          >
            Xác nhận khóa tin
          </Button>
        </Group>
      </Modal>

      {/* Reject modal — shown when "Từ chối báo cáo" is clicked */}
      <Modal
        opened={rejectModalOpened}
        onClose={() => setRejectModalOpened(false)}
        title={<Text fw={600}>Từ chối báo cáo</Text>}
      >
        <Textarea
          label="Ghi chú xử lý"
          placeholder="Nhập ghi chú cho hành động này..."
          value={rejectNote}
          onChange={(e) => setRejectNote(e.currentTarget.value)}
          minRows={3}
          data-autofocus
        />
        <Group justify="flex-end" mt={24}>
          <Button variant="default" onClick={() => setRejectModalOpened(false)}>Hủy</Button>
          <Button
            color="red"
            loading={rejectSubmitting}
            onClick={handleRejectSubmit}
          >
            Xác nhận Từ chối
          </Button>
        </Group>
      </Modal>
    </Box>
  );
}

