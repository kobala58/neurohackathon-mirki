import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Pełny, poprawny URL do backendu
    baseUrl: "http://localhost:8000",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }),
  endpoints: () => ({}),
});
