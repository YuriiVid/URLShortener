import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./client";

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["About", "ShortenedUrls"] as const,
  endpoints: () => ({}),
});
