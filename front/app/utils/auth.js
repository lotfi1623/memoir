export function isLoggedIn() {
  return typeof window !== "undefined" && !!localStorage.getItem("userToken");
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userToken");
    window.location.href = "/auth/authEns";
  }
}

export function getUserType() {
  return typeof window !== "undefined" ? localStorage.getItem("userType") : null;
} 