import { api } from "@shared";
import type { AdminDto, CreateAdminDto } from "../types";

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdmins: build.query<AdminDto[], void>({
      query: () => ({
        url: "/admins",
        method: "GET",
      }),
      providesTags: [{ type: "Admins", id: "LIST" }],
    }),

    getAdmin: build.query<AdminDto, number>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Admins", id }],
    }),

    createAdmin: build.mutation<AdminDto, CreateAdminDto>({
      query: (dto) => ({
        url: "/admins",
        method: "POST",
        body: dto,
      }),
      invalidatesTags: [{ type: "Admins", id: "LIST" }],
    }),

    deleteAdmin: build.mutation<void, number>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Admins", id: "LIST" },
        { type: "Admins", id },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminsQuery, useGetAdminQuery, useCreateAdminMutation, useDeleteAdminMutation } = adminApi;
