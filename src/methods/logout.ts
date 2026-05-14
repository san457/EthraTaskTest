import api from "@/lib/api";

export const logout = async ({
  setIsAuthenticated,
  setUser,
}: {
  setIsAuthenticated: (val: boolean | null) => void;
  setUser: (user: any) => void;
}) => {
  try {
    await api.post("/auth/logout");

    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('accessToken');

    // Reload the page
    window.location.reload();
  } catch (err) {
    // Silent fail on logout, the token is likely already invalid or client clears it anyway
  }
};


