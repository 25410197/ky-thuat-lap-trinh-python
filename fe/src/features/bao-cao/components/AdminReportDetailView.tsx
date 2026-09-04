"use client";

import { useEffect, useState } from "react";
import { Badge, Box, Button, Checkbox, Group, Modal, Skeleton, Text, Textarea, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { baoCaoApi } from "@/lib/api/bao-cao";
import type { BaoCaoChiTiet } from "@/schemas/bao-cao";
import { formatDateVi } from "@/lib/utils";
import { IconCheck, IconX, IconBan } from "@tabler/icons-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

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

  const openActionModal = (type: "RESOLVED" | "REJECTED", shouldBlockPost: boolean = false) => {
    setActionType(type);
    setBlockPost(shouldBlockPost);
    if (type === "RESOLVED" && shouldBlockPost) {
      setBlockReason(`Vi phạm quy định tin đăng: ${data?.lyDo || ""}`);
      setNote("Đã xác minh báo cáo và khóa tin đăng.");
    } else if (type === "RESOLVED" && !shouldBlockPost) {
      setBlockReason("");
      setNote("Đã xử lý báo cáo (không khóa tin đăng).");
    } else {
      setBlockReason("");
      setNote("Báo cáo không đủ căn cứ hoặc không hợp lệ.");
    }
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
        ghiChuXuLy: note.trim(),
        khoaTin: blockPost,
        lyDoKhoa: blockPost ? blockReason.trim() : null,
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
            {!data.tinDang.isBlocked && (
              <Button
                color="red"
                leftSection={<IconBan size={18} />}
                onClick={() => openActionModal("RESOLVED", true)}
              >
                Khóa tin & Duyệt báo cáo
              </Button>
            )}
            <Button
              color="green"
              variant="light"
              leftSection={<IconCheck size={18} />}
              onClick={() => openActionModal("RESOLVED", false)}
            >
              Duyệt không khóa tin
            </Button>
            <Button
              color="gray"
              variant="subtle"
              leftSection={<IconX size={18} />}
              onClick={() => openActionModal("REJECTED", false)}
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
            <Group gap="xs" mt={4}>
              <Text size="sm"><b>Trạng thái:</b></Text>
              {data.tinDang.isBlocked ? (
                <Badge color="red" variant="light" radius="sm">Đã bị khóa</Badge>
              ) : (
                <Badge color="green" variant="light" radius="sm">Đang hiển thị</Badge>
              )}
            </Group>
            <Button
              component={Link}
              href={ROUTES.chiTietTinDang(data.tinDang.id.toString())}
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
        onClose={() => !submitting && setModalOpened(false)}
        title={
          <Text fw={600} c={actionType === "RESOLVED" ? (blockPost ? "red" : "green") : "gray"}>
            {actionType === "RESOLVED"
              ? blockPost
                ? "Khóa tin đăng & Duyệt báo cáo"
                : "Duyệt báo cáo (Không khóa tin)"
              : "Từ chối báo cáo"}
          </Text>
        }
      >
        <Box>
          <Text size="sm" mb="xs">
            <b>Tin đăng:</b> {data.tinDang.tieuDe} (ID: {data.tinDang.id})
          </Text>
          <Text size="sm" mb="md" c="dimmed">
            <b>Lý do báo cáo:</b> {data.lyDo}
          </Text>

          {actionType === "RESOLVED" && (
            <Box mb="md">
              <Checkbox
                label="Khóa tin đăng này ngay lập tức"
                checked={blockPost}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setBlockPost(checked);
                  if (checked && !blockReason) {
                    setBlockReason(`Vi phạm quy định tin đăng: ${data.lyDo}`);
                  }
                }}
                color="red"
              />
            </Box>
          )}

          {blockPost && (
            <TextInput
              label="Lý do khóa tin"
              placeholder="Ví dụ: Tin đăng sai sự thật..."
              required
              mb="md"
              value={blockReason}
              onChange={(e) => setBlockReason(e.currentTarget.value)}
            />
          )}

          <Textarea
            label="Ghi chú xử lý"
            placeholder="Nhập ghi chú cho hành động này..."
            value={note}
            onChange={(e) => setNote(e.currentTarget.value)}
            minRows={3}
            mb="xl"
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpened(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button
              color={actionType === "RESOLVED" ? (blockPost ? "red" : "green") : "gray"}
              loading={submitting}
              onClick={handleSubmit}
            >
              {actionType === "RESOLVED"
                ? blockPost
                  ? "Xác nhận khóa tin"
                  : "Xác nhận đã xử lý"
                : "Xác nhận từ chối"}
            </Button>
          </Group>
        </Box>
      </Modal>
    </Box>
  );
}
