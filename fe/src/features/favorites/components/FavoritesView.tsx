"use client";

import { useEffect, useState } from "react";
import { Text, SimpleGrid, Loader, Center, Alert, Group } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { EmptyState } from "@/components/common/EmptyState";
import { AppPagination } from "@/components/ui/AppPagination";
import { PropertyCard } from "@/features/rental-posts/components/PropertyCard";
import { favoritesApi } from "@/features/favorites/api/favorites.api";
import type { RentalPostSummary } from "@/types/rental-post";

const SO_TIN_MOI_TRANG = 12;

export function FavoritesView() {
  const [items, setItems] = useState<RentalPostSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [vuaBoYeuThich, setVuaBoYeuThich] = useState<Set<number>>(new Set());

  useEffect(() => {
    let daHuy = false;

    Promise.resolve()
      .then(() => {
        setDangTai(true);
        setLoi(null);
        return favoritesApi.list(page, SO_TIN_MOI_TRANG);
      })
      .then((ket_qua) => {
        if (daHuy) return;
        setItems(ket_qua.items);
        setTotal(ket_qua.total);
        setVuaBoYeuThich(new Set());
      })
      .catch(() => {
        if (daHuy) return;
        setLoi("Không tải được danh sách tin yêu thích. Vui lòng thử lại.");
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

  const hienThi = items.filter((post) => !vuaBoYeuThich.has(post.id));
  const tongSoTrang = Math.max(1, Math.ceil(total / SO_TIN_MOI_TRANG));

  return (
    <div>
      <Text
        component="h1"
        mb={24}
        fz={30}
        fw={700}
        c="var(--color-brand)"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Tin đăng yêu thích
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
      ) : hienThi.length === 0 ? (
        <EmptyState
          title="Chưa có tin đăng yêu thích"
          description="Nhấn biểu tượng trái tim trên tin đăng để lưu vào đây."
        />
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={24}>
            {hienThi.map((post) => (
              <PropertyCard
                key={post.id}
                post={post}
                onFavoriteChange={(id, daYeuThich) => {
                  if (daYeuThich) return;
                  setVuaBoYeuThich((truoc) => new Set(truoc).add(id));
                }}
              />
            ))}
          </SimpleGrid>
          {tongSoTrang > 1 ? (
            <Group justify="center" mt={40}>
              <AppPagination total={tongSoTrang} value={page} onChange={setPage} />
            </Group>
          ) : null}
        </>
      )}
    </div>
  );
}
