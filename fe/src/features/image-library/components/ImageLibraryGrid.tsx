"use client";

import { useEffect, useState } from "react";
import { ActionIcon, Box, Center, Group, Image, Loader, SimpleGrid, Stack, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconPencil, IconPhoto, IconTrash, IconUpload, IconX } from "@tabler/icons-react";
import { AppInput } from "@/components/ui/AppInput";
import { AppModal } from "@/components/ui/AppModal";
import { AppButton } from "@/components/ui/AppButton";
import { AppPagination } from "@/components/ui/AppPagination";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { imageLibraryApi } from "../api/image-library.api";
import type { AnhThuVienItem } from "@/types/image-library";

const SO_ANH_MOI_TRANG = 12;

interface ImageLibraryGridProps {
  selectable?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (item: AnhThuVienItem) => void;
  isSelectDisabled?: (item: AnhThuVienItem) => boolean;
  manageable?: boolean;
}

export function ImageLibraryGrid({
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  isSelectDisabled,
  manageable = false,
}: ImageLibraryGridProps) {
  const [tuKhoaNhap, setTuKhoaNhap] = useState("");
  const [tuKhoa] = useDebouncedValue(tuKhoaNhap, 400);
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<AnhThuVienItem[]>([]);
  const [total, setTotal] = useState(0);
  const [dangTai, setDangTai] = useState(true);
  const [dangTaiLen, setDangTaiLen] = useState(false);

  const [deletingItem, setDeletingItem] = useState<AnhThuVienItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [renamingItem, setRenamingItem] = useState<AnhThuVienItem | null>(null);
  const [tenMoi, setTenMoi] = useState("");
  const [renaming, setRenaming] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [tuKhoa]);

  useEffect(() => {
    let daHuy = false;
    setDangTai(true);
    imageLibraryApi
      .list({ page, pageSize: SO_ANH_MOI_TRANG, q: tuKhoa || undefined })
      .then((res) => {
        if (daHuy) return;
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => {
        if (daHuy) return;
        notifications.show({ color: "red", message: "Không tải được thư viện ảnh." });
      })
      .finally(() => {
        if (daHuy) return;
        setDangTai(false);
      });
    return () => {
      daHuy = true;
    };
  }, [page, tuKhoa, reloadKey]);

  const taiLai = () => setReloadKey((k) => k + 1);

  const handleDropUpload = (files: File[]) => {
    setDangTaiLen(true);
    imageLibraryApi
      .upload(files)
      .then((uploaded) => {
        notifications.show({ color: "green", message: `Đã tải lên ${uploaded.length} ảnh.` });
        if (selectable && onToggleSelect) {
          uploaded.forEach((item) => onToggleSelect(item));
        }
        setPage(1);
        taiLai();
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Tải ảnh lên thất bại." });
      })
      .finally(() => {
        setDangTaiLen(false);
      });
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    setDeleting(true);
    imageLibraryApi
      .remove(deletingItem.id)
      .then(() => {
        notifications.show({ color: "green", message: "Đã xoá ảnh khỏi thư viện." });
        setDeletingItem(null);
        taiLai();
      })
      .catch((err) => {
        notifications.show({
          color: "red",
          message: err?.message || "Không xoá được ảnh (có thể đang dùng trong 1 tin đăng).",
        });
      })
      .finally(() => {
        setDeleting(false);
      });
  };

  const handleConfirmRename = () => {
    if (!renamingItem || !tenMoi.trim()) return;
    setRenaming(true);
    imageLibraryApi
      .rename(renamingItem.id, tenMoi.trim())
      .then(() => {
        notifications.show({ color: "green", message: "Đã đổi tên ảnh." });
        setRenamingItem(null);
        taiLai();
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Đổi tên ảnh thất bại." });
      })
      .finally(() => {
        setRenaming(false);
      });
  };

  const tongSoTrang = Math.max(1, Math.ceil(total / SO_ANH_MOI_TRANG));
  const selectedIdSet = new Set(selectedIds);

  return (
    <Stack gap={20}>
      <AppInput
        placeholder="Tìm theo tên tệp..."
        value={tuKhoaNhap}
        onChange={(event) => setTuKhoaNhap(event.currentTarget.value)}
      />

      <Dropzone
        onDrop={handleDropUpload}
        accept={IMAGE_MIME_TYPE}
        maxSize={5 * 1024 ** 2}
        loading={dangTaiLen}
        style={{
          border: "2px dashed var(--color-brand-muted)",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
        }}
      >
        <Group justify="center" gap="md" style={{ minHeight: 60, pointerEvents: "none" }}>
          <Dropzone.Accept>
            <IconUpload size={28} color="var(--mantine-color-blue-6)" stroke={1.5} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={28} color="var(--mantine-color-red-6)" stroke={1.5} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={28} color="var(--mantine-color-dimmed)" stroke={1.5} />
          </Dropzone.Idle>
          <Text size="sm" c="dimmed">
            Kéo thả hoặc click để tải ảnh mới lên thư viện (tối đa 5MB/ảnh)
          </Text>
        </Group>
      </Dropzone>

      {dangTai ? (
        <Center py={60}>
          <Loader color="brand" />
        </Center>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có ảnh nào" description="Tải ảnh lên để bắt đầu xây dựng thư viện." />
      ) : (
        <>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing="sm">
            {items.map((item) => {
              const daChon = selectedIdSet.has(item.id);
              const bTat = selectable && !daChon && isSelectDisabled?.(item);
              return (
                <Box
                  key={item.id}
                  pos="relative"
                  onClick={() => {
                    if (selectable && !bTat) onToggleSelect?.(item);
                  }}
                  style={{
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: selectable && !bTat ? "pointer" : "default",
                    opacity: bTat ? 0.4 : 1,
                    border: daChon
                      ? "3px solid var(--color-brand)"
                      : "1px solid var(--color-border)",
                  }}
                >
                  <Image src={item.url} alt={item.tenTep} style={{ aspectRatio: "1/1" }} fit="cover" />
                  {daChon ? (
                    <Center
                      pos="absolute"
                      top={6}
                      right={6}
                      w={22}
                      h={22}
                      bg="var(--color-brand)"
                      style={{ borderRadius: 9999 }}
                    >
                      <IconCheck size={14} color="white" stroke={3} />
                    </Center>
                  ) : null}
                  {manageable ? (
                    <Group gap={4} pos="absolute" top={4} right={4}>
                      <ActionIcon
                        variant="white"
                        color="brand"
                        size="sm"
                        radius="xl"
                        onClick={(event) => {
                          event.stopPropagation();
                          setRenamingItem(item);
                          setTenMoi(item.tenTep);
                        }}
                        aria-label="Đổi tên ảnh"
                      >
                        <IconPencil size={14} />
                      </ActionIcon>
                      <ActionIcon
                        variant="white"
                        color="red"
                        size="sm"
                        radius="xl"
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeletingItem(item);
                        }}
                        aria-label="Xoá ảnh"
                      >
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  ) : null}
                  <Text size="xs" c="dimmed" p={4} lineClamp={1} title={item.tenTep}>
                    {item.tenTep}
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
          <Group justify="center">
            <AppPagination total={tongSoTrang} value={page} onChange={setPage} />
          </Group>
        </>
      )}

      <ConfirmDialog
        opened={deletingItem !== null}
        title="Xoá ảnh khỏi thư viện?"
        description={`"${deletingItem?.tenTep}" sẽ bị xoá vĩnh viễn. Nếu ảnh đang dùng trong 1 tin đăng, cần gỡ khỏi tin đó trước.`}
        confirmLabel="Xoá"
        danger
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />

      <AppModal
        opened={renamingItem !== null}
        onClose={() => setRenamingItem(null)}
        title="Đổi tên ảnh"
        centered
        size="sm"
      >
        <Stack gap={16}>
          <AppInput
            label="Tên tệp"
            value={tenMoi}
            onChange={(event) => setTenMoi(event.currentTarget.value)}
          />
          <Group justify="flex-end" gap={12}>
            <AppButton variant="ghost" onClick={() => setRenamingItem(null)} disabled={renaming}>
              Huỷ
            </AppButton>
            <AppButton onClick={handleConfirmRename} loading={renaming}>
              Lưu
            </AppButton>
          </Group>
        </Stack>
      </AppModal>
    </Stack>
  );
}
