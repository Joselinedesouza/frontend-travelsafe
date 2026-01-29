// authManager.ts

let logoutHandler: (() => void) | null = null;

export function registerLogout(fn: () => void) {
  logoutHandler = fn;
}

export function triggerLogout() {
  if (logoutHandler) {
    logoutHandler();
  } else {
    // fallback di sicurezza
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("role");
  }
}
