/**
 * Exact/raw error messages are not shown to the user from any error.
 * The real error is only logged to the console for debugging; the user sees a clean generic message instead.
 */
export function getFriendlyErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  // the original error will remain in the console for developers
  console.error("[App Error]:", error);
  return fallback;
}