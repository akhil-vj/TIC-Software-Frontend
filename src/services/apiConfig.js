// Normalizes the API base URL and upgrades to HTTPS when the site is served over HTTPS.
export const getApiBaseUrl = () => {
  const rawUrl = (import.meta.env.REACT_APP_API_URL || "").trim();

  if (!rawUrl) {
    return "";
  }

  const baseUrl = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

  if (
    typeof window !== "undefined" &&
    window.location?.protocol === "https:" &&
    baseUrl.startsWith("http://")
  ) {
    return baseUrl.replace("http://", "https://");
  }

  return baseUrl;
};

export const buildApiUrl = (path = "") => `${getApiBaseUrl()}${path}`;
