import type { AxiosError } from 'axios'
import { isAxiosError } from 'axios'
import { toast } from 'react-toastify'

// Type alias for error messages
type ErrorMessage = string

// Map to keep track of recent errors and their timestamps
const recentErrors = new Map<ErrorMessage, number>()

// Debounce time in milliseconds
const DEBOUNCE_TIME = 5000 // 5 seconds debounce time

// Mapping of HTTP status codes to error messages
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad Request: Please check your input.',
  401: 'Unauthorized: Please log in.',
  403: "Forbidden: You don't have permission to access this resource.",
  404: 'Not Found: The requested resource was not found.',
  500: 'Internal Server Error: Please try again later.',
  502: 'Bad Gateway: Please try again later.',
  503: 'Service Unavailable: Please try again later.',
  504: 'Gateway Timeout: Please try again later.',
}

/**
 * Debounces error messages to prevent identical messages from being shown repeatedly.
 * @param message - The error message to debounce.
 * @returns A boolean indicating whether the message should be shown.
 */
function debounceErrorMessage(message: ErrorMessage): boolean {
  const now = Date.now()
  if (recentErrors.has(message)) {
    const lastShownTime = recentErrors.get(message) || 0
    if (now - lastShownTime < DEBOUNCE_TIME) {
      return false
    }
  }
  recentErrors.set(message, now)
  setTimeout(() => recentErrors.delete(message), DEBOUNCE_TIME)
  return true
}

/**
 * Handles Axios errors by showing appropriate error messages based on HTTP status codes.
 * @param error - The Axios error to handle.
 */
function handleAxiosError(error: AxiosError): void {
  const { response } = error
  if (response) {
    const message =
      HTTP_STATUS_MESSAGES[response.status] || `Unexpected Error: ${response.statusText}`
    showError(message)
  } else {
    showError('Network Error: Please check your internet connection.')
  }
}

/**
 * Handles generic errors by showing their message.
 * @param error - The generic error to handle.
 */
function handleGenericError(error: Error): void {
  showError(error.message)
}

/**
 * Displays an error message using toast notifications, with debouncing.
 * @param message - The error message to show.
 */
function showError(message: ErrorMessage): void {
  if (debounceErrorMessage(message)) {
    toast.error(message)
  }
}

/**
 * Main error handler function that processes unknown errors.
 * Delegates to specific handlers based on the error type.
 * @param error - The error to handle.
 */
export function errorToaster(error: unknown): void {
  if (isAxiosError(error)) {
    handleAxiosError(error)
  } else if (error instanceof Error) {
    handleGenericError(error)
  } else {
    showError('An unknown error occurred.')
  }
}
