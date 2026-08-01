"use client";

import type { ReactNode } from "react";
import { Grid, NumberInput, Textarea, Checkbox, Radio, Text, Box, Stack, SimpleGrid } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { notifications } from "@mantine/notifications";
import { IconCloudUpload } from "@tabler/icons-react";
import { AppInput } from "@/components/ui/AppInput";
import { AppSelect } from "@/components/ui/AppSelect";
import { AppButton } from "@/components/ui/AppButton";
import { rentalPostSchema, type RentalPostInput } from "../schemas/rental-post.schema";
import styles from "@/styles/interactions.module.css";

// Danh sách loại hình / tỉnh thành chưa được Figma liệt kê chi tiết (dropdown đóng trong thiết kế)
// nên dùng danh sách hợp lý cho thị trường VN, còn nhãn/placeholder giữ đúng nguyên văn Figma.
const PROPERTY_TYPES = ["Căn hộ", "Nhà phố", "Biệt thự", "Phòng trọ", "Văn phòng"];
const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
const AMENITIES = [
  "WiFi Miễn phí",
  "Chỗ đậu xe",
  "Thang máy",
  "Bảo vệ 24/7",
  "Nội thất cơ bản",
  "Máy lạnh",
];

function FormSection({ title, children }: { title: string; children: ReactNode }) {
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
  const form = useForm<RentalPostInput>({
    initialValues: {
      title: "",
      propertyType: "",
      areaM2: 0,
      priceVnd: 0,
      province: "",
      district: "",
      ward: "",
      address: "",
      description: "",
      amenities: [],
      contactName: "",
      contactPhone: "",
      contactMethod: "call",
    },
    validate: zodResolver(rentalPostSchema),
  });

  // Mock submit — chưa gọi API tạo tin đăng, sẽ nối ở ticket features/rental-posts.
  const handleSubmit = form.onSubmit((values) => {
    notifications.show({
      color: "green",
      title: "Đã lưu tin đăng (demo)",
      message: `"${values.title}" đã được lưu ở chế độ nháp.`,
    });
    form.reset();
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
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <AppSelect
                    label="Tỉnh / Thành phố"
                    placeholder="Chọn Tỉnh/Thành"
                    data={PROVINCES}
                    {...form.getInputProps("province")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <AppInput
                    label="Quận / Huyện"
                    placeholder="Chọn Quận/Huyện"
                    {...form.getInputProps("district")}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <AppInput
                    label="Phường / Xã"
                    placeholder="Chọn Phường/Xã"
                    {...form.getInputProps("ward")}
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
                    <Box component="label" key={amenity} className={styles.checkboxOption}>
                      <Checkbox value={amenity} color="brand" />
                      {amenity}
                    </Box>
                  ))}
                </SimpleGrid>
              </Checkbox.Group>
            </FormSection>

            <FormSection title="Hình ảnh tài sản">
              <Text size="sm" c="dimmed" mb={16}>
                Tải lên tối đa 20 hình ảnh. Hình ảnh đầu tiên sẽ được dùng làm ảnh đại diện. Khuyến
                nghị sử dụng ảnh ngang, độ phân giải cao.
              </Text>
              <Box className={styles.uploadDropzone}>
                <IconCloudUpload size={40} stroke={1.5} color="var(--color-brand-muted)" />
                <Text fz="lg" c="var(--color-brand)" style={{ fontFamily: "var(--font-heading)" }}>
                  Kéo thả ảnh vào đây
                </Text>
                <Text fz="sm" c="var(--color-text-muted)">
                  hoặc click để chọn từ thiết bị
                </Text>
              </Box>
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
                style={{ fontFamily: "var(--font-heading)", borderBottom: "1px solid var(--color-border)" }}
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
                <Radio.Group label="Phương thức ưu tiên" {...form.getInputProps("contactMethod")}>
                  <Stack gap={12} mt={12}>
                    <Radio color="brand" value="call" label="Gọi điện trực tiếp" />
                    <Radio color="brand" value="zalo" label="Nhắn tin Zalo / SMS" />
                  </Stack>
                </Radio.Group>
              </Stack>
            </Box>

            <Stack gap={12}>
              <AppButton type="submit" size="lg" fullWidth>
                Đăng tin ngay
              </AppButton>
              <AppButton variant="outline" size="md" fullWidth onClick={() => form.reset()}>
                Hủy bỏ
              </AppButton>
            </Stack>
          </Stack>
        </Grid.Col>
      </Grid>
    </form>
  );
}
