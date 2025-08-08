import { api } from "@shared";
import type { AboutResponse, UpdateAboutRequest } from "../types";

export const aboutApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAbout: build.query<AboutResponse, void>({
      query: () => ({ url: "/about", method: "GET" }),
      providesTags: (_result, _error) => [{ type: "About" as const }],
    }),

    updateAbout: build.mutation<void, UpdateAboutRequest>({
      query: (body) => ({ url: "/about", method: "PUT", body }),
      invalidatesTags: (_result, _error) => [{ type: "About" as const }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAboutQuery, useUpdateAboutMutation } = aboutApi;
