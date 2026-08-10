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
    chiTietTinDuyet: (id: number) => `/rental-posts/chi-tiet-tin-duyet/${id}`,
    duyetTinDang: (id: number) => `/rental-posts/duyet-tin-dang/${id}`,
    tuChoiTinDang: (id: number) => `/rental-posts/tu-choi-tin-dang/${id}`,
  },
  danhMuc: {
    loaiBatDongSan: "/loai-bat-dong-san",
    loaiBatDongSanQuanTri: "/loai-bat-dong-san/quan-tri",
    loaiBatDongSanDetail: (id: number) => `/loai-bat-dong-san/${id}`,
    loaiBatDongSanTrangThai: (id: number) => `/loai-bat-dong-san/${id}/trang-thai`,
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
  thongKe: {
    tongQuan: "/thong-ke/tong-quan",
  },
} as const;
