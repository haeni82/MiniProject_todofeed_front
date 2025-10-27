const API_BASE_URL = "http://localhost:8080";

export const validateToken = async (): Promise<boolean> => {
  const token = localStorage.getItem("authToken");
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/api/todos`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      localStorage.removeItem("authToken");
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    localStorage.removeItem("authToken");
    return false;
  }
};

export const clearInvalidToken = () => {
  validateToken().then(isValid => {
    if (!isValid) {
      window.location.reload();
    }
  });
};