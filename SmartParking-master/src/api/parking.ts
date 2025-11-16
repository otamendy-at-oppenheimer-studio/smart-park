import { API_BASE_URL } from "./index";

export const getAllSpaces = async () => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces`);
  return response.json();
};

export const getSpaceById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces/${id}`);
  return response.json();
};

export const setSpaceStatus = async (id: string, status: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};

export const createMultipleSpaces = async (count: number, token: string) => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces/multiple`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ count }),
  });
  return response.json();
};

export const createSpace = async (data: { status?: string; floor?: string }, token: string) => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateSpace = async (id: string, data: Partial<{ status: string; floor: string }>, token: string) => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteSpace = async (id: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/parking/spaces/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
