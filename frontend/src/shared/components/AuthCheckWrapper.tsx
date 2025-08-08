import React from "react";
import { useAuth } from "@features/auth/hooks";

export default function AuthCheckWrapper({ children }: { children: React.ReactNode }) {
  useAuth(); 
  return <>{children}</>;
}
