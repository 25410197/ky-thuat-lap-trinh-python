"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Center, Group, Loader, Stack, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { ImageLibraryPickerModal } from "@/features/image-library/components/ImageLibraryPickerModal";
import { ApiError } from "@/lib/api/api-error";
import { ROUTES } from "@/constants/routes";
import type { AnhThuVienItem } from "@/types/image-library";
import { tinTucApi, type NewsFormPayload, type NewsStatus } from "../api/tin-tuc.api";
import { newsFormSchema, type NewsFormInput } from "../schemas/tin-tuc.schema";
import { QuillEditor } from "./QuillEditor";

const DAU_TIENG_VIET = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(DAU_TIENG_VIET, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminNewsFormView({ id }: { id?: number }) {
  const router = useRouter();
  const isEditMode = id !== undefined;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState<"draft" | "publish" | "hide" | null>(null);
  const [currentStatus, setCurrentStatus] = useState<NewsStatus>("draft");
  const [slugTouched, setSlugTouched] = useState(false);
  const [coverImage, setCoverImage] = useState<AnhThuVienItem | null>(null);
  const [pickerOpened, setPickerOpened] = useState(false);

  const form = useForm<NewsFormInput>({
    initialValues: { title: "", slug: "", excerpt: "", contentHtml: "" },
    validate: zodResolver(newsFormSchema),
  });

  useEffect(() => {
    if (id === undefined) return;
    tinTucApi
      .adminDetail(id)
      .then((data) => {
        form.setValues({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          contentHtml: data.contentHtml,
        });
        setCurrentStatus(data.status);
        setSlugTouched(true);
        if (data.coverImageId && data.coverImageUrl) {
          setCoverImage({
            id: data.coverImageId,
            url: data.coverImageUrl,
            tenTep: "",
            dungLuong: 0,
            ngayTaiLen: "",
          });
        }
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Không tải được bài viết." });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function handleTitleChange(value: string) {
    form.setFieldValue("title", value);
    if (!slugTouched) {
      form.setFieldValue("slug", slugify(value));
    }
  }

  function handleRegenerateSlug() {
    setSlugTouched(false);
    form.setFieldValue("slug", slugify(form.values.title));
  }

  async function handleSave(publish: boolean) {
    const validation = form.validate();
    if (validation.hasErrors) return;

    setSaving(publish ? "publish" : "draft");
    try {
      const payload: NewsFormPayload = {
        title: form.values.title.trim(),
        slug: form.values.slug?.trim() || undefined,
        excerpt: form.values.excerpt.trim(),
        contentHtml: form.values.contentHtml,
        coverImageId: coverImage?.id ?? null,
      };

      const saved = isEditMode
        ? await tinTucApi.adminUpdate(id, payload)
        : await tinTucApi.adminCreate(payload);

      if (publish) {
        await tinTucApi.adminChangeStatus(saved.id, "published");
      }

      notifications.show({
        color: "green",
        message: publish ? "Đã đăng bài viết." : "Đã lưu bài viết.",
      });
      router.push(ROUTES.quanTriTinTuc);
    } catch (error) {
      notifications.show({
        color: "red",
        message: error instanceof ApiError ? error.message : "Có lỗi xảy ra, vui lòng thử lại.",
      });
    } finally {
      setSaving(null);
    }
  }

  async function handleHide() {
    if (id === undefined) return;
    setSaving("hide");
    try {
      await tinTucApi.adminChangeStatus(id, "hidden");
      notifications.show({ color: "green", message: "Đã ẩn bài viết." });
      router.push(ROUTES.quanTriTinTuc);
    } catch {
      notifications.show({ color: "red", message: "Không thể ẩn bài viết." });
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <Center py={80}>
        <Loader color="brand" />
      </Center>
    );
  }

  return (
    <Box maw={860}>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {isEditMode ? "Sửa bài viết" : "Viết bài mới"}
      </Text>

      <Stack gap={16}>
        <AppInput
          label="Tiêu đề"
          placeholder="VD: Giá thuê căn hộ quý 3 tăng nhẹ"
          value={form.values.title}
          onChange={(event) => handleTitleChange(event.currentTarget.value)}
          error={form.errors.title}
        />

        <Group align="flex-end" gap={12}>
          <AppInput
            style={{ flex: 1 }}
            label="Đường dẫn (slug)"
            placeholder="gia-thue-can-ho-quy-3-tang-nhe"
            value={form.values.slug}
            onChange={(event) => {
              setSlugTouched(true);
              form.setFieldValue("slug", event.currentTarget.value);
            }}
            error={form.errors.slug}
          />
          <AppButton type="button" variant="ghost" onClick={handleRegenerateSlug}>
            Tạo lại từ tiêu đề
          </AppButton>
        </Group>

        <Textarea
          label="Tóm tắt"
          description={`${form.values.excerpt.length}/200 ký tự — hiển thị ở card danh sách`}
          placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
          minRows={2}
          autosize
          maxLength={200}
          value={form.values.excerpt}
          onChange={(event) => form.setFieldValue("excerpt", event.currentTarget.value)}
          error={form.errors.excerpt}
        />

        <div>
          <Text fz="sm" fw={500} mb={8}>
            Ảnh bìa (tùy chọn)
          </Text>
          {coverImage ? (
            <Group gap={12}>
              <Box
                w={96}
                h={64}
                style={{
                  position: "relative",
                  borderRadius: 6,
                  overflow: "hidden",
                  border: "1px solid var(--color-border)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage.url}
                  alt=""
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <AppButton type="button" variant="ghost" size="sm" onClick={() => setPickerOpened(true)}>
                Đổi ảnh
              </AppButton>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                color="red"
                leftSection={<IconX size={14} />}
                onClick={() => setCoverImage(null)}
              >
                Xóa
              </AppButton>
            </Group>
          ) : (
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              leftSection={<IconPhoto size={16} />}
              onClick={() => setPickerOpened(true)}
            >
              Chọn ảnh bìa
            </AppButton>
          )}
        </div>

        <div>
          <Text fz="sm" fw={500} mb={8}>
            Nội dung
          </Text>
          <QuillEditor
            value={form.values.contentHtml}
            onChange={(html) => form.setFieldValue("contentHtml", html)}
          />
          {form.errors.contentHtml ? (
            <Text fz="xs" c="red" mt={4}>
              {form.errors.contentHtml}
            </Text>
          ) : null}
        </div>

        <Group justify="flex-end" gap={12} mt={16}>
          {isEditMode && currentStatus === "published" ? (
            <AppButton
              type="button"
              variant="ghost"
              color="red"
              loading={saving === "hide"}
              disabled={saving !== null}
              onClick={handleHide}
            >
              Ẩn bài
            </AppButton>
          ) : null}
          <AppButton
            type="button"
            variant="outline"
            loading={saving === "draft"}
            disabled={saving !== null}
            onClick={() => handleSave(false)}
          >
            Lưu nháp
          </AppButton>
          <AppButton
            type="button"
            loading={saving === "publish"}
            disabled={saving !== null}
            onClick={() => handleSave(true)}
          >
            Đăng bài
          </AppButton>
        </Group>
      </Stack>

      <ImageLibraryPickerModal
        opened={pickerOpened}
        mode="single"
        onClose={() => setPickerOpened(false)}
        onConfirm={(selected) => {
          setCoverImage(selected[0] ?? null);
          setPickerOpened(false);
        }}
      />
    </Box>
  );
}
