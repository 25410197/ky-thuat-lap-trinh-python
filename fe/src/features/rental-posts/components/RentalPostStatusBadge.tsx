import { Badge } from "@mantine/core";
import {
  RENTAL_POST_STATUS_COLOR,
  RENTAL_POST_STATUS_LABEL_VI,
  type RentalPostStatus,
} from "@/constants/rental-post-status";

export function RentalPostStatusBadge({ status }: { status: RentalPostStatus }) {
  return (
    <Badge color={RENTAL_POST_STATUS_COLOR[status]} variant="light" radius="sm">
      {RENTAL_POST_STATUS_LABEL_VI[status]}
    </Badge>
  );
}
