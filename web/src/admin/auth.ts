const STORAGE_KEY = "mei:admin-token";

export const ADMIN_USERNAME = "mei";
export const ADMIN_PASSWORD = "mei2026";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function setAdminToken(token: string) {
  window.sessionStorage.setItem(STORAGE_KEY, token);
}

export function clearAdminToken() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function isAdminLoggedIn() {
  return Boolean(getAdminToken());
}

export function matchHardcodedCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
