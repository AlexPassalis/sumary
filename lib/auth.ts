export function formatAuthError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'An error occurred'
  if (message.toLowerCase().includes('email rate limit exceeded')) {
    return 'Too many email requests. Please wait 60 minutes before trying again.'
  }
  return message
}
