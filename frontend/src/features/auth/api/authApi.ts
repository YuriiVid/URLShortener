import { api } from "@shared";
import type { LoginCredentials, UserDataResponse, RegisterCredentials, TitleMessageResponse } from "../types";
import { logout, setToken, setUser } from "../authSlice";
import { rawBaseQuery } from "@shared/api/client";

const KEEP_UNUSED_DATA_SECONDS = 15 * 60;

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<UserDataResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.jwt));
          dispatch(setUser(data.user));
        } catch (error) {
          console.log(error);
        }
      },
    }),

    getCurrentUser: build.query<UserDataResponse, void>({
      queryFn: async (_, api, extraOptions) => {
        const result = await rawBaseQuery({ url: "/auth/refresh-user-token", method: "GET" }, api, extraOptions);

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as UserDataResponse };
      },
      keepUnusedDataFor: KEEP_UNUSED_DATA_SECONDS,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.jwt));
          dispatch(setUser(data.user));
        } catch {
          dispatch(logout());
        }
      },
    }),

    logout: build.mutation<TitleMessageResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data.title === "Success") {
          dispatch(logout());
        }
      },
    }),

    register: build.mutation<TitleMessageResponse, RegisterCredentials>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation, useGetCurrentUserQuery } = authApi;
