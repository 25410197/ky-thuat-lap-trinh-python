"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/common/ErrorState";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Đã có lỗi xảy ra"
      description="Rất tiếc, có lỗi không mong muốn. Vui lòng thử lại."
      onRetry={reset}
    />
  );
}
