import { API_BASE_URL } from "./index";

export const getSensors = async () => {
  const response = await fetch(`${API_BASE_URL}/sensors`);
  return response.json();
};

export const getSensorById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/sensors/${id}`);
  return response.json();
};

export const createSensor = async (data: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/sensors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateSensor = async (id: string, data: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/sensors/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const processSensorEvent = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/sensors/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteSensor = async (id: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/sensors/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
