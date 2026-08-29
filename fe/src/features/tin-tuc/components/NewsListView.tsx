"use client";

import { useEffect, useState } from "react";
import { Box, Text, SimpleGrid, Group, Center, Loader, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { AppPagination } from "@/components/ui/AppPagination";
import { EmptyState } from "@/components/common/EmptyState";
import { tinTucApi, type NewsListItem } from "../api/tin-tuc.api";
import { NewsCard } from "./NewsCard";

const SO_BAI_MOI_TRANG = 9;

export function NewsListView() {
  const [items, setItems] = useState<NewsListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let daHuy = false;
    setDangTai(true);
    setLoi(null);
    tinTucApi
      .list({ page, pageSize: SO_BAI_MOI_TRANG })
      .then((ket_qua) => {
        if (daHuy) return;
        setItems(ket_qua.items);
        setTotal(ket_qua.total);
      })
      .catch(() => {
        if (daHuy) return;
        setLoi("Không tải được danh sách bài viết. Vui lòng thử lại.");
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (daHuy) return;
        setDangTai(false);
      });
    return () => {
      daHuy = true;
    };
  }, [page]);

  const tongSoTrang = Math.max(1, Math.ceil(total / SO_BAI_MOI_TRANG));

  return (
    <Box px={32} py={40}>
      <Text
        component="h1"
        mb={8}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Thông tin thị trường
      </Text>
      <Text mb={32} c="var(--color-text-muted)">
        Tin tức và phân tích thị trường cho thuê bất động sản.
      </Text>

      {loi ? (
        <Alert color="red" icon={<IconAlertCircle size={18} />} mb={24}>
          {loi}
        </Alert>
      ) : null}

      {dangTai ? (
        <Center py={80}>
          <Loader color="brand" />
        </Center>
      ) : items.length === 0 ? (
        <EmptyState title="Chưa có bài viết nào" description="Quay lại sau để xem tin tức mới nhất." />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={24}>
            {items.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </SimpleGrid>
          <Group justify="center" mt={40}>
            <AppPagination total={tongSoTrang} value={page} onChange={setPage} />
          </Group>
        </>
      )}
    </Box>
  );
}
