//emptyApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const emptySplitApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:8000", // Zmiana tutaj
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  }),
  endpoints: () => ({}),
});
