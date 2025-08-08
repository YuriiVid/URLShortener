import { useAppSelector } from "@/app/hooks";
import { useGetCurrentUserQuery } from "./api/authApi";

export function useAuth() {
  const token = useAppSelector((s) => s.auth.token);

 const { isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  const authLoading = isLoading || isFetching;

  return {
    token,
    authLoading,
  };
}
