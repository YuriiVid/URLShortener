import type { Middleware } from "@reduxjs/toolkit";
import { isRejectedWithValue } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils";

interface RejectedAction {
  type: string;
  payload: FetchBaseQueryError | SerializedError;
  error: SerializedError;
  meta?: {
    arg: {
      endpointName?: string;
      originalArgs?: any;
    };
  };
}

function isRejectedActionWithPayload(action: unknown): action is RejectedAction {
  return isRejectedWithValue(action);
}

const SILENT_ENDPOINTS = ["refresh-user-token", "getCurrentUser"];

const SILENT_URL_PATTERNS = ["/api/auth/refresh-user-token"];

function shouldShowToast(action: RejectedAction): boolean {
  if (action.meta?.arg?.endpointName) {
    const endpointName = action.meta.arg.endpointName;
    console.log(endpointName);

    if (SILENT_ENDPOINTS.includes(endpointName)) {
      return false;
    }
  }

  if (action.payload && "status" in action.payload) {
    const payload = action.payload as FetchBaseQueryError;

    if (payload.data && typeof payload.data === "object" && "url" in payload.data) {
      const url = payload.data.url as string;
      if (SILENT_URL_PATTERNS.some((pattern) => url.includes(pattern))) {
        return false;
      }
    }
  }

  if (action.type) {
    const hasMatchingPattern = SILENT_URL_PATTERNS.some((pattern) =>
      action.type.toLowerCase().includes(pattern.replace(/[^a-z0-9]/gi, "").toLowerCase())
    );
    if (hasMatchingPattern) {
      return false;
    }
  }

  return true;
}

export const errorToastMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedActionWithPayload(action)) {
    if (shouldShowToast(action)) {
      const errorMessage = getErrorMessage(action.payload);
      toast.error(errorMessage);
    }
  }

  return next(action);
};
