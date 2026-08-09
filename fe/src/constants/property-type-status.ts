export const PROPERTY_TYPE_STATUS = {
  active: "active",
  hidden: "hidden",
} as const;

export type PropertyTypeStatus = (typeof PROPERTY_TYPE_STATUS)[keyof typeof PROPERTY_TYPE_STATUS];

export const PROPERTY_TYPE_STATUS_LABEL_VI: Record<PropertyTypeStatus, string> = {
  active: "Đang hoạt động",
  hidden: "Đã ẩn",
};

export const PROPERTY_TYPE_STATUS_COLOR: Record<PropertyTypeStatus, string> = {
  active: "green",
  hidden: "gray",
};
