import { api } from "@shared";
import type { ShortenedUrl, FullShortenedUrl, CreateShortenedUrl } from "../types";

export const shortenedUrlApi = api.injectEndpoints({
  endpoints: (build) => ({
    getShortenedUrls: build.query<ShortenedUrl[], void>({
      query: () => ({
        url: "/shortenedUrls",
        method: "GET",
      }),
      providesTags: [{ type: "ShortenedUrls", id: "LIST" }],
    }),

    getShortenedUrl: build.query<FullShortenedUrl, number>({
      query: (id) => ({
        url: `/shortenedUrls/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "ShortenedUrls", id }],
    }),

    createShortenedUrl: build.mutation<ShortenedUrl, CreateShortenedUrl>({
      query: (dto) => ({
        url: "/shortenedUrls",
        method: "POST",
        body: dto,
      }),
      invalidatesTags: [{ type: "ShortenedUrls", id: "LIST" }],
    }),

    deleteShortenedUrl: build.mutation<void, number>({
      query: (id) => ({
        url: `/shortenedUrls/${id}`,
        method: "Delete",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "ShortenedUrls", id: "LIST" },
        { type: "ShortenedUrls", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShortenedUrlsQuery,
  useGetShortenedUrlQuery,
  useCreateShortenedUrlMutation,
  useDeleteShortenedUrlMutation,
} = shortenedUrlApi;
