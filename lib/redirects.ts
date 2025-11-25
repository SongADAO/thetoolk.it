function getSafeQueryRedirect(defaultRoute: string) {
  // Get the redirect parameter from the URL query string
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") ?? defaultRoute;

  // Ensure redirectTo is a local URL to prevent open redirect vulnerabilities
  const redirectTo =
    redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : defaultRoute;

  return redirectTo;
}

export { getSafeQueryRedirect };
