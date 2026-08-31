import { useState } from "react";
import { useToast } from "@/app/providers/ToastProvider";
import { getFriendlyErrorMessage } from "@/app/lib/utils/errors";

type SubmitOptions = {
  onSuccess?: (data?: any) => void | Promise<void>;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
};

export function useFormSubmit() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const submit = async (
    asyncFn: () => Promise<any>,
    options: SubmitOptions = {}
  ) => {
    const {
      onSuccess,
      onError,
      successMessage = "Operation completed successfully!",
      errorMessage = "Something went wrong. Please try again.",
    } = options;

    setIsLoading(true);
    try {
      const result = await asyncFn();
      addToast(successMessage, "success");
      await onSuccess?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(errorMessage);
      addToast(getFriendlyErrorMessage(err, errorMessage), "error"); // exact error আর দেখাবে না
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { submit, isLoading };
}