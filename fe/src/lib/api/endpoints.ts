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
    mine: "/rental-posts/me",
  },
  favorites: {
    list: "/favorites",
    toggle: (rentalPostId: string) => `/favorites/${rentalPostId}`,
  },
  users: {
    list: "/users",
    detail: (id: string) => `/users/${id}`,
  },
} as const;
