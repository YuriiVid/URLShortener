import { useAppSelector } from "@/app/hooks";
import { useGetCurrentUserQuery } from "./api/authApi";

export function useAuth() {
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  const { isLoading, isFetching } = useGetCurrentUserQuery(undefined, {
    skip: !!user,
    refetchOnMountOrArgChange: false,
    refetchOnReconnect: false,
    refetchOnFocus: false,
  });

  const authLoading = isLoading || isFetching;

  return {
    user,
    token,
    authLoading,
  };
}
