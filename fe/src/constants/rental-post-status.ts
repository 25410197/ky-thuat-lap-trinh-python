export const RENTAL_POST_STATUS = {
  draft: "draft",
  pending: "pending",
  published: "published",
  rejected: "rejected",
  archived: "archived",
  deleted: "deleted",
} as const;

export type RentalPostStatus = (typeof RENTAL_POST_STATUS)[keyof typeof RENTAL_POST_STATUS];

export const RENTAL_POST_STATUS_LABEL_VI: Record<RentalPostStatus, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  published: "Đã đăng",
  rejected: "Bị từ chối",
  archived: "Đã ẩn",
  deleted: "Đã xoá",
};

export const RENTAL_POST_STATUS_COLOR: Record<RentalPostStatus, string> = {
  draft: "gray",
  pending: "gold",
  published: "green",
  rejected: "red",
  archived: "dark",
  deleted: "gray",
};
