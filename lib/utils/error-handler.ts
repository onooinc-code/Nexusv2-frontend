/**
 * Utility functions for consistent error handling across the application
 */

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Unknown error occurred';
  
  // If it's an ApiError with message property
  if (typeof error === 'object' && 'message' in error) {
    return (error as ApiError).message;
  }
  
  // If it's an Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // If it's a string
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return JSON.stringify(error);
};

export const getErrorDetails = (error: unknown) => {
  const message = getErrorMessage(error);
  const status = (error as any)?.status;
  const code = (error as any)?.code;
  
  return {
    message,
    status,
    code,
    fullError: error,
  };
};

export const logError = (context: string, error: unknown) => {
  const details = getErrorDetails(error);
  const errorInfo = {
    context,
    message: details.message,
    ...(details.status && { status: details.status }),
    ...(details.code && { code: details.code }),
  };
  console.error(context + ':', errorInfo);
};
