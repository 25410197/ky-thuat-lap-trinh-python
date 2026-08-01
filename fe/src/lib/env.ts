function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return value;
}

export const env = {
  apiUrl: requireEnv(process.env.NEXT_PUBLIC_API_URL, "NEXT_PUBLIC_API_URL"),
};
