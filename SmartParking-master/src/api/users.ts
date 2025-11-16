import { API_BASE_URL } from "./index";

export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`);
  return response.json();
};

export const getUserById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  return response.json();
};

export const createUser = async (data: { email: string; password: string; role?: string }, token: string) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateUser = async (id: string, data: Partial<{ email: string; password: string; role: string }>, token: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteUser = async (id: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
