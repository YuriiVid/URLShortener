import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

interface ValidationError {
  errors: Record<string, string[]>;
  type?: string;
  title?: string;
  status?: number;
  traceId?: string;
}

interface MessageError {
  message: string;
}

interface PasswordPolicyError {
  code: string;
  description: string;
}

function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  return typeof error === "object" && error != null && "status" in error;
}

function hasDataProperty(error: FetchBaseQueryError): error is FetchBaseQueryError & { data: any } {
  return "data" in error && error.data != null;
}

function isValidationError(data: unknown): data is ValidationError {
  return typeof data === "object" && data != null && "errors" in data && typeof (data as any).errors === "object";
}

function isErrorWithMessage(data: unknown): data is MessageError {
  return typeof data === "object" && data != null && "message" in data && typeof (data as any).message === "string";
}

function isPasswordPolicyErrorArray(data: unknown): data is PasswordPolicyError[] {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === "object" &&
    data[0] !== null &&
    "code" in data[0] &&
    "description" in data[0] &&
    typeof (data[0] as any).description === "string"
  );
}

function formatValidationErrors(errors: Record<string, string[]>): string {
  const errorMessages: string[] = [];

  for (const [field, messages] of Object.entries(errors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      const fieldErrors = messages.map((msg) =>
        msg.toLowerCase().includes(field.toLowerCase()) ? msg : `${field}: ${msg}`
      );
      errorMessages.push(...fieldErrors);
    }
  }

  return errorMessages.join(", ");
}

function formatPasswordPolicyErrors(errors: PasswordPolicyError[]): string {
  return errors.map((e) => e.description).join(", ");
}

export function getErrorMessage(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) return "Unknown error";

  if (isFetchBaseQueryError(error)) {
    if (error.status === "FETCH_ERROR") return "Network error - check your connection";
    if (error.status === "PARSING_ERROR") return "Response parse error";

    if (error.status === "CUSTOM_ERROR") {
      if (hasDataProperty(error)) {
        if (isValidationError(error.data)) {
          return formatValidationErrors(error.data.errors);
        }
        if (isPasswordPolicyErrorArray(error.data)) {
          return formatPasswordPolicyErrors(error.data);
        }
        if (isErrorWithMessage(error.data)) {
          return error.data.message;
        }
      }
      return "Custom error";
    }

    if (hasDataProperty(error)) {
      if (isValidationError(error.data)) {
        return formatValidationErrors(error.data.errors);
      }
      if (isPasswordPolicyErrorArray(error.data)) {
        return formatPasswordPolicyErrors(error.data);
      }
      if (error.data.title && typeof error.data.title === "string") {
        return error.data.title;
      }
      if (isErrorWithMessage(error.data)) {
        return error.data.message;
      }
    }

    return `Error ${error.status}`;
  }

  return error.message ?? "An unknown error occurred";
}
