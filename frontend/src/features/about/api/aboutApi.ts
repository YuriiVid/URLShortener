import { api } from "@shared";

export interface AboutResponse {
  content: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface UpdateAboutRequest {
  content: string;
}

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
