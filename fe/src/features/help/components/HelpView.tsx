"use client";

import { Accordion, Box, Group, Paper, Text } from "@mantine/core";
import { IconMail, IconClock } from "@tabler/icons-react";

interface CauHoi {
  cauHoi: string;
  traLoi: string;
}

interface NhomFaq {
  nhan: string;
  cacCauHoi: CauHoi[];
}

const SUPPORT_EMAIL = "admin@example.com";

const DANH_SACH_FAQ: NhomFaq[] = [
  {
    nhan: "Với người tìm nhà",
    cacCauHoi: [
      {
        cauHoi: "Tìm nhà theo khu vực/giá/diện tích như thế nào?",
        traLoi:
          "Vào trang \"Bất động sản\", dùng bộ lọc phía trên danh sách: chọn loại hình (phòng trọ, căn hộ, nhà nguyên căn), tỉnh/thành, quận/huyện (hoặc xã/phường mới), khoảng giá thuê và diện tích. Kết quả tự động cập nhật ngay khi bạn thay đổi bộ lọc.",
      },
      {
        cauHoi: "Xem thông tin liên hệ chủ nhà ở đâu?",
        traLoi:
          "Thông tin liên hệ (tên, số điện thoại) của người đăng tin hiển thị ở trang chi tiết tin đăng. Bạn cần đăng nhập trước mới xem được — quy định này giúp hạn chế tài khoản ảo và tin nhắn spam tới chủ nhà.",
      },
      {
        cauHoi: "Lưu tin yêu thích để xem lại sau bằng cách nào?",
        traLoi:
          "Bấm biểu tượng trái tim ở góc ảnh mỗi tin đăng (hoặc ở trang chi tiết tin) để lưu vào mục yêu thích. Xem lại toàn bộ danh sách đã lưu qua biểu tượng trái tim trên thanh menu hoặc mục \"Tin yêu thích\" trong menu tài khoản.",
      },
      {
        cauHoi: "Phát hiện tin đăng sai sự thật/lừa đảo thì báo cáo ở đâu?",
        traLoi:
          "Vào trang chi tiết tin đăng, bấm nút \"Báo cáo tin đăng\", chọn lý do phù hợp rồi gửi. Đội ngũ quản trị sẽ xem xét và xử lý — tin vi phạm có thể bị khóa khỏi hệ thống.",
      },
    ],
  },
  {
    nhan: "Với người đăng tin cho thuê",
    cacCauHoi: [
      {
        cauHoi: "Đăng tin cho thuê cần chuẩn bị gì?",
        traLoi:
          "Chuẩn bị ảnh thật của nhà/phòng, mô tả chi tiết (tối thiểu 30 ký tự), giá thuê, diện tích, địa chỉ cụ thể và thông tin liên hệ. Tin đăng càng đầy đủ, rõ ràng thì càng dễ được duyệt và thu hút người thuê.",
      },
      {
        cauHoi: "Vì sao tin đăng của tôi đang ở trạng thái \"Chờ duyệt\"?",
        traLoi:
          "Mọi tin đăng mới đều cần quản trị viên kiểm duyệt trước khi hiển thị công khai, nhằm đảm bảo chất lượng và hạn chế tin giả. Bạn có thể theo dõi trạng thái duyệt ở mục \"Tin đăng của tôi\" trong menu tài khoản.",
      },
      {
        cauHoi: "Sửa/xóa tin đã đăng như thế nào?",
        traLoi:
          "Vào menu tài khoản → \"Tin đăng của tôi\", bấm biểu tượng sửa để chỉnh sửa nội dung tin hoặc biểu tượng xóa để gỡ tin khỏi hệ thống. Lưu ý tin đã xóa không thể khôi phục.",
      },
      {
        cauHoi: "Quản lý ảnh tin đăng ở \"Thư viện ảnh\" ra sao?",
        traLoi:
          "Vào menu tài khoản → \"Thư viện ảnh\" để tải ảnh lên trước, sau đó chọn ảnh làm ảnh đại diện hoặc ảnh phụ khi đăng/chỉnh sửa tin. Bạn cũng có thể đổi tên hoặc xóa ảnh không còn dùng.",
      },
    ],
  },
  {
    nhan: "Chung",
    cacCauHoi: [
      {
        cauHoi: "Đăng ký/đăng nhập tài khoản như thế nào?",
        traLoi:
          "Bấm \"Đăng nhập\" ở góc phải thanh menu, chọn \"Đăng ký\" nếu chưa có tài khoản. Điền email, mật khẩu và họ tên rồi xác nhận — sau khi đăng ký, bạn có thể đăng nhập ngay.",
      },
      {
        cauHoi: "Quên mật khẩu thì làm sao?",
        traLoi:
          "Hệ thống hiện chưa hỗ trợ tự đặt lại mật khẩu qua email. Nếu quên mật khẩu, vui lòng liên hệ hỗ trợ qua email bên dưới để được hỗ trợ cấp lại quyền truy cập.",
      },
    ],
  },
];

export function HelpView() {
  return (
    <Box px={32} py={40} maw={860} mx="auto">
      <Text
        component="h1"
        mb={8}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Trợ giúp
      </Text>
      <Text mb={40} c="var(--color-text-muted)">
        Câu hỏi thường gặp về việc tìm nhà, đăng tin và sử dụng tài khoản.
      </Text>

      {DANH_SACH_FAQ.map((nhom) => (
        <Box key={nhom.nhan} mb={32}>
          <Text
            mb={12}
            fz="sm"
            fw={700}
            tt="uppercase"
            c="var(--color-gold)"
            style={{ letterSpacing: "0.08em" }}
          >
            {nhom.nhan}
          </Text>
          <Accordion variant="separated" radius="var(--radius-card)">
            {nhom.cacCauHoi.map((muc, chiSo) => (
              <Accordion.Item key={chiSo} value={`${nhom.nhan}-${chiSo}`}>
                <Accordion.Control>
                  <Text fw={600} c="var(--color-brand)">
                    {muc.cauHoi}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text c="var(--color-text-muted)">{muc.traLoi}</Text>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </Box>
      ))}

      <Paper
        radius="var(--radius-card)"
        withBorder
        p={24}
        mt={16}
        bg="var(--color-surface-muted)"
      >
        <Text
          mb={16}
          fz="xs"
          fw={700}
          tt="uppercase"
          c="var(--color-brand-muted)"
          style={{ letterSpacing: "0.08em" }}
        >
          Liên hệ hỗ trợ
        </Text>
        <Group gap={32} wrap="wrap">
          <Group gap={10} align="flex-start" wrap="nowrap">
            <IconMail size={20} color="var(--color-gold)" stroke={1.75} style={{ marginTop: 2 }} />
            <div>
              <Text fz="xs" c="dimmed">
                Email hỗ trợ
              </Text>
              <Text
                component="a"
                href={`mailto:${SUPPORT_EMAIL}`}
                fz="lg"
                fw={700}
                c="var(--color-brand)"
              >
                {SUPPORT_EMAIL}
              </Text>
            </div>
          </Group>
          <Group gap={10} align="flex-start" wrap="nowrap">
            <IconClock size={20} color="var(--color-gold)" stroke={1.75} style={{ marginTop: 2 }} />
            <div>
              <Text fz="xs" c="dimmed">
                Thời gian phản hồi dự kiến
              </Text>
              <Text fz="lg" fw={700} c="var(--color-brand)">
                Trong vòng 24 giờ
              </Text>
            </div>
          </Group>
        </Group>
      </Paper>
    </Box>
  );
}
