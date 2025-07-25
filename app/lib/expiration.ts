function hasExpired(expiry: string | null, bufferSeconds: number) {
  if (!expiry) {
    return false;
  }

  const expiryDate = new Date(expiry);

  // Check if token is expired or about to expire (5 minutes buffer)
  const now = new Date();

  // Convert seconds to milliseconds
  const bufferMilliseconds = bufferSeconds * 1000;

  return now.getTime() > expiryDate.getTime() - bufferMilliseconds;
}

export { hasExpired };
