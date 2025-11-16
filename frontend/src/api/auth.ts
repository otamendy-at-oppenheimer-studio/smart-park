import { API_BASE_URL } from "./index";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en el login');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  // Si tienes un endpoint de logout en el backend, puedes llamarlo aquí
  // const response = await fetch(`${API_BASE_URL}/auth/logout`, {
  //   method: "POST",
  //   headers: { 
  //     "Authorization": `Bearer ${token}`,
  //     "Content-Type": "application/json" 
  //   },
  // });
};

export const refreshToken = async (token: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json" 
    },
  });

  if (!response.ok) {
    throw new Error('Error refreshing token');
  }

  return response.json();
};

export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};
