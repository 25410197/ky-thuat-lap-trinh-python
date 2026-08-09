export const endpoints = {
  health: "/health",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  rentalPosts: {
    list: "/rental-posts",
    detail: (id: string) => `/rental-posts/${id}`,
    update: (id: string) => `/rental-posts/${id}`,
    edit: (id: string) => `/rental-posts/${id}/chinh-sua`,
    mine: "/rental-posts/me",
    choDuyet: "/rental-posts/cho-duyet",
  },
  danhMuc: {
    loaiBatDongSan: "/loai-bat-dong-san",
    tinhThanh: "/tinh-thanh",
    quanHuyen: (tinhThanhId: number) => `/tinh-thanh/${tinhThanhId}/quan-huyen`,
    xaPhuongMoi: (tinhThanhId: number) => `/tinh-thanh/${tinhThanhId}/xa-phuong-moi`,
  },
  imageLibrary: {
    list: "/image-library",
    detail: (id: number) => `/image-library/${id}`,
  },
  favorites: {
    list: "/favorites",
    toggle: (rentalPostId: string) => `/favorites/${rentalPostId}`,
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
    updateStatus: (id: string) => `/users/${id}/trang-thai`,
  },
} as const;
