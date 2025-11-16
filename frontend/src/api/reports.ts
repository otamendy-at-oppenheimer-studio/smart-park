import { API_BASE_URL } from "./index";

export const getReports = async () => {
  const response = await fetch(`${API_BASE_URL}/reports`);
  return response.json();
};

export const createReport = async (data: { parkingSpaceId: string; startDate: string; endDate: string }, token: string) => {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const updateReport = async (id: string, data: any, token: string) => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const deleteReport = async (id: string, token: string) => {
  const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.json();
};
