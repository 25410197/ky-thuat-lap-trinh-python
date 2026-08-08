"use client";

import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import styles from "@/styles/interactions.module.css";
import {
  Box,
  Checkbox,
  Grid,
  NumberInput,
  Radio,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCloudUpload, IconPhoto, IconUpload, IconX, IconTrash } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { Image, Group } from "@mantine/core";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { rentalPostsApi } from "../api/rental-posts.api";
import { danhMucApi } from "../api/danh-muc.api";
import type { PhuongXaMoi, TinhThanh } from "@/types/danh-muc";
import {
  rentalPostSchema,
  type RentalPostInput,
} from "../schemas/rental-post.schema";

const PROPERTY_TYPES = [
  "Căn hộ",
  "Nhà phố",
  "Biệt thự",
  "Phòng trọ",
  "Văn phòng",
];
const SO_ANH_PHU_TOI_DA = 19;
const AMENITIES = [
  "WiFi Miễn phí",
  "Chỗ đậu xe",
  "Thang máy",
  "Bảo vệ 24/7",
  "Nội thất cơ bản",
  "Máy lạnh",
];

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box pt={24} style={{ borderTop: "1px solid var(--color-border)" }}>
      <Text
        component="h2"
        mb={24}
        fz="xl"
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

export function RentalPostForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<RentalPostInput>({
    initialValues: {
      title: "",
      propertyType: "",
      areaM2: 0,
      priceVnd: 0,
      provinceId: "",
      wardId: "",
      address: "",
      description: "",
      coverImage: "",
      galleryImages: [],
      amenities: [],
      contactName: "",
      contactPhone: "",
      contactMethod: "call",
      bedrooms: 0,
      bathrooms: 0,
    },
    validate: (values) => {
      const parsed = rentalPostSchema.safeParse(values);
      if (parsed.success) return {};
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      return errors;
    },
  });

  const [danhSachTinh, setDanhSachTinh] = useState<TinhThanh[]>([]);
  const [danhSachXaPhuong, setDanhSachXaPhuong] = useState<PhuongXaMoi[]>([]);

  useEffect(() => {
    danhMucApi
      .tinhThanh()
      .then(setDanhSachTinh)
      .catch(() => setDanhSachTinh([]));
  }, []);

  useEffect(() => {
    if (!form.values.provinceId) {
      setDanhSachXaPhuong([]);
      return;
    }
    danhMucApi
      .xaPhuongMoi(Number(form.values.provinceId))
      .then(setDanhSachXaPhuong)
      .catch(() => setDanhSachXaPhuong([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.values.provinceId]);

  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const handleDropCoverImage = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsUploadingCover(true);
    rentalPostsApi
      .uploadImages([file])
      .then((res) => {
        form.setFieldValue("coverImage", res.urls[0]);
        notifications.show({ color: "green", message: "Đã tải ảnh chính thành công!" });
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Tải ảnh chính thất bại!" });
      })
      .finally(() => {
        setIsUploadingCover(false);
      });
  };

  const handleRemoveCoverImage = () => {
    form.setFieldValue("coverImage", "");
  };

  const handleDropGalleryFiles = (files: File[]) => {
    const soConTrong = SO_ANH_PHU_TOI_DA - (form.values.galleryImages?.length || 0);
    const filesHopLe = files.slice(0, soConTrong);
    if (filesHopLe.length < files.length) {
      notifications.show({
        color: "yellow",
        message: `Chỉ nhận thêm được ${filesHopLe.length} ảnh (tối đa ${SO_ANH_PHU_TOI_DA} ảnh phụ).`,
      });
    }
    if (filesHopLe.length === 0) return;

    setIsUploadingGallery(true);
    rentalPostsApi
      .uploadImages(filesHopLe)
      .then((res) => {
        const currentImages = form.values.galleryImages || [];
        form.setFieldValue("galleryImages", [...currentImages, ...res.urls]);
        notifications.show({ color: "green", message: "Đã tải ảnh thành công!" });
      })
      .catch(() => {
        notifications.show({ color: "red", message: "Tải ảnh thất bại!" });
      })
      .finally(() => {
        setIsUploadingGallery(false);
      });
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const currentImages = form.values.galleryImages || [];
    form.setFieldValue(
      "galleryImages",
      currentImages.filter((_, idx) => idx !== indexToRemove),
    );
  };

  const handleSubmit = form.onSubmit((values) => {
    setIsLoading(true);
    rentalPostsApi
      .create(values)
      .then((res) => {
        notifications.show({
          color: "green",
          title: "Đăng tin thành công!",
          message: "Tin của bạn đang chờ quản trị viên duyệt.",
        });
        router.push("/tin-dang-cua-toi");
      })
      .catch((err) => {
        notifications.show({
          color: "red",
          message: "Có lỗi xảy ra khi đăng tin!",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  });

  return (
    <form onSubmit={handleSubmit}>
      <Grid gap={{ base: 32, lg: 24 }}>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap={40}>
            <FormSection title="Thông tin cơ bản">
              <Grid gap={16}>
                <Grid.Col span={12}>
                  <AppInput
                    label="Tiêu đề tin đăng"
                    placeholder="VD: Cho thuê căn hộ dịch vụ cao cấp thiết kế Đông Dương..."
                    maxLength={99}
                    {...form.getInputProps("title")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <AppSelect
                    label="Loại bất động sản"
                    placeholder="Chọn loại hình"
                    data={PROPERTY_TYPES}
                    {...form.getInputProps("propertyType")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Diện tích sử dụng"
                    placeholder="0"
                    min={0}
                    radius="sm"
                    rightSection={<Text size="xs">M²</Text>}
                    {...form.getInputProps("areaM2")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Số phòng ngủ"
                    placeholder="0"
                    min={0}
                    radius="sm"
                    {...form.getInputProps("bedrooms")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Số phòng tắm"
                    placeholder="0"
                    min={0}
                    radius="sm"
                    {...form.getInputProps("bathrooms")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <NumberInput
                    label="Mức giá cho thuê"
                    placeholder="Nhập số tiền"
                    min={0}
                    radius="sm"
                    thousandSeparator=","
                    rightSection={<Text size="xs">VNĐ/THÁNG</Text>}
                    rightSectionWidth={90}
                    {...form.getInputProps("priceVnd")}
                  />
                </Grid.Col>
              </Grid>
            </FormSection>

            <FormSection title="Vị trí tài sản">
              <Grid gap={16}>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <AppSelect
                    label="Tỉnh / Thành phố"
                    placeholder="Chọn Tỉnh/Thành"
                    data={danhSachTinh.map((tinh) => ({ value: String(tinh.id), label: tinh.ten }))}
                    searchable
                    nothingFoundMessage="Không tìm thấy"
                    {...form.getInputProps("provinceId")}
                    onChange={(value) => {
                      form.setFieldValue("provinceId", value ?? "");
                      form.setFieldValue("wardId", "");
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <AppSelect
                    label="Phường / Xã"
                    placeholder={form.values.provinceId ? "Chọn Phường/Xã" : "Chọn tỉnh/thành trước"}
                    data={danhSachXaPhuong.map((xa) => ({ value: String(xa.id), label: xa.ten }))}
                    disabled={!form.values.provinceId}
                    searchable
                    nothingFoundMessage="Không tìm thấy"
                    {...form.getInputProps("wardId")}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <AppInput
                    label="Địa chỉ chi tiết"
                    placeholder="Số nhà, Tên đường..."
                    {...form.getInputProps("address")}
                  />
                </Grid.Col>
              </Grid>
            </FormSection>

            <FormSection title="Mô tả & Tiện ích">
              <Textarea
                label="Mô tả chi tiết"
                description="Tối thiểu 30 ký tự"
                placeholder="Mô tả về kiến trúc, không gian, lịch sử hoặc những điểm nổi bật của bất động sản..."
                minRows={4}
                radius="sm"
                mb={24}
                {...form.getInputProps("description")}
              />
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={12}>
                Tiện ích có sẵn
              </Text>
              <Checkbox.Group {...form.getInputProps("amenities")}>
                <SimpleGrid cols={{ base: 2, sm: 3 }} spacing={12}>
                  {AMENITIES.map((amenity) => (
                    <Box
                      component="label"
                      key={amenity}
                      className={styles.checkboxOption}
                    >
                      <Checkbox value={amenity} color="brand" />
                      {amenity}
                    </Box>
                  ))}
                </SimpleGrid>
              </Checkbox.Group>
            </FormSection>

            <FormSection title="Hình ảnh tài sản">
              <Text size="sm" fw={700} tt="uppercase" c="dimmed" mb={12}>
                Ảnh chính (ảnh đại diện)
              </Text>
              {form.values.coverImage ? (
                <Box
                  pos="relative"
                  maw={280}
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                >
                  <Image
                    src={form.values.coverImage}
                    radius="md"
                    style={{ aspectRatio: "4/3" }}
                    fit="cover"
                    alt="Ảnh đại diện"
                  />
                  <ActionIcon
                    variant="white"
                    color="red"
                    size="md"
                    radius="xl"
                    pos="absolute"
                    top={4}
                    right={4}
                    onClick={handleRemoveCoverImage}
                    style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                  >
                    <IconTrash size={16} stroke={2} />
                  </ActionIcon>
                </Box>
              ) : (
                <Dropzone
                  onDrop={handleDropCoverImage}
                  accept={IMAGE_MIME_TYPE}
                  maxSize={5 * 1024 ** 2}
                  maxFiles={1}
                  loading={isUploadingCover}
                  style={{
                    border: form.errors.coverImage ? "1px solid red" : "2px dashed var(--color-brand-muted)",
                    padding: "32px",
                    borderRadius: "8px",
                    textAlign: "center",
                  }}
                >
                  <Group justify="center" gap="xl" style={{ minHeight: 100, pointerEvents: "none" }}>
                    <Dropzone.Accept>
                      <IconUpload size={40} color="var(--mantine-color-blue-6)" stroke={1.5} />
                    </Dropzone.Accept>
                    <Dropzone.Reject>
                      <IconX size={40} color="var(--mantine-color-red-6)" stroke={1.5} />
                    </Dropzone.Reject>
                    <Dropzone.Idle>
                      <IconPhoto size={40} color="var(--mantine-color-dimmed)" stroke={1.5} />
                    </Dropzone.Idle>
                    <Box>
                      <Text size="lg" inline c="var(--color-brand)" fw={600} mb={4}>
                        Kéo thả ảnh chính vào đây
                      </Text>
                      <Text size="sm" c="dimmed" inline>
                        Hoặc click để chọn từ thiết bị (Tối đa 5MB)
                      </Text>
                    </Box>
                  </Group>
                </Dropzone>
              )}
              {form.errors.coverImage && (
                <Text c="red" size="sm" mt={8}>
                  {form.errors.coverImage}
                </Text>
              )}

              <Text size="sm" fw={700} tt="uppercase" c="dimmed" mt={32} mb={12}>
                Ảnh phụ
              </Text>
              <Text size="sm" c="dimmed" mb={16}>
                Tải lên tối đa {SO_ANH_PHU_TOI_DA} hình ảnh phụ, không tính ảnh chính.
              </Text>
              <Dropzone
                onDrop={handleDropGalleryFiles}
                accept={IMAGE_MIME_TYPE}
                maxSize={5 * 1024 ** 2}
                loading={isUploadingGallery}
                disabled={(form.values.galleryImages?.length || 0) >= SO_ANH_PHU_TOI_DA}
                style={{
                  border: "2px dashed var(--color-brand-muted)",
                  padding: "40px",
                  borderRadius: "8px",
                  textAlign: "center"
                }}
              >
                <Group justify="center" gap="xl" style={{ minHeight: 120, pointerEvents: 'none' }}>
                  <Dropzone.Accept>
                    <IconUpload size={50} color="var(--mantine-color-blue-6)" stroke={1.5} />
                  </Dropzone.Accept>
                  <Dropzone.Reject>
                    <IconX size={50} color="var(--mantine-color-red-6)" stroke={1.5} />
                  </Dropzone.Reject>
                  <Dropzone.Idle>
                    <IconPhoto size={50} color="var(--mantine-color-dimmed)" stroke={1.5} />
                  </Dropzone.Idle>

                  <Box>
                    <Text size="xl" inline c="var(--color-brand)" fw={600} mb={8}>
                      Kéo thả ảnh vào đây
                    </Text>
                    <Text size="sm" c="dimmed" inline>
                      Hoặc click để chọn từ thiết bị (Tối đa 5MB)
                    </Text>
                  </Box>
                </Group>
              </Dropzone>
              {form.values.galleryImages && form.values.galleryImages.length > 0 && (
                <Box mt={24}>
                  <Text size="sm" fw={600} mb={12} c="var(--color-brand)">
                    Ảnh phụ đã tải lên ({form.values.galleryImages.length}/{SO_ANH_PHU_TOI_DA})
                  </Text>
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
                    {form.values.galleryImages.map((url, index) => (
                      <Box
                        key={index}
                        pos="relative"
                        style={{
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                        }}
                      >
                        <Image
                          src={url}
                          radius="md"
                          style={{ aspectRatio: '4/3' }}
                          fit="cover"
                          alt={`Ảnh phụ ${index + 1}`}
                        />
                        <ActionIcon
                          variant="white"
                          color="red"
                          size="md"
                          radius="xl"
                          pos="absolute"
                          top={4}
                          right={4}
                          onClick={() => handleRemoveGalleryImage(index)}
                          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'transform 0.1s' }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                        >
                          <IconTrash size={16} stroke={2} />
                        </ActionIcon>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              )}
            </FormSection>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap={32} pos="sticky" top={96}>
            <Box
              p={32}
              bg="var(--color-surface)"
              style={{
                borderRadius: "var(--radius-card)",
                border: "1px solid var(--color-border)",
                boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
              }}
            >
              <Text
                component="h2"
                mb={24}
                pb={16}
                fz="xl"
                fw={700}
                c="var(--color-brand)"
                style={{
                  fontFamily: "var(--font-heading)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                Thông tin liên hệ
              </Text>
              <Stack gap={16}>
                <AppInput
                  label="Tên người liên hệ"
                  placeholder="Nguyễn Văn A"
                  {...form.getInputProps("contactName")}
                />
                <AppInput
                  label="Số điện thoại"
                  placeholder="0901234567"
                  {...form.getInputProps("contactPhone")}
                />
                <Radio.Group
                  label="Phương thức ưu tiên"
                  {...form.getInputProps("contactMethod")}
                >
                  <Stack gap={12} mt={12}>
                    <Radio
                      color="brand"
                      value="call"
                      label="Gọi điện trực tiếp"
                    />
                    <Radio
                      color="brand"
                      value="zalo"
                      label="Nhắn tin Zalo / SMS"
                    />
                  </Stack>
                </Radio.Group>
              </Stack>
            </Box>

            <Stack gap={12}>
              <AppButton type="submit" size="lg" fullWidth loading={isLoading}>
                Đăng tin ngay
              </AppButton>
              <AppButton
                variant="outline"
                size="md"
                fullWidth
                onClick={() => form.reset()}
              >
                Hủy bỏ
              </AppButton>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </form>
  );
}
