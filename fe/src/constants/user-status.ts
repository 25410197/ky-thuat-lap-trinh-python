export const USER_STATUS = {
  pending: "pending",
  active: "active",
  locked: "locked",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const USER_STATUS_LABEL_VI: Record<UserStatus, string> = {
  pending: "Chờ xác minh",
  active: "Đang hoạt động",
  locked: "Đã khóa",
};

export const USER_STATUS_COLOR: Record<UserStatus, string> = {
  pending: "gold",
  active: "green",
  locked: "red",
};
