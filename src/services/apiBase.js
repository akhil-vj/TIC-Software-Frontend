// Returns the API base URL while avoiding mixed-content (http calls from an https page).
// If the page is served over https and the configured URL is http, we upgrade it to https.
export function getApiBaseUrl() {
  const envUrl = import.meta.env.REACT_APP_API_URL || "";

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    envUrl.startsWith("http://")
  ) {
    return envUrl.replace(/^http:\/\//, "https://");
  }

  return envUrl;
}
