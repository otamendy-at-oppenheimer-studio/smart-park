import { API_BASE_URL } from "./index";

export const createOccupancyEvent = async (data: { parkingSpaceId: string; status: string }) => {
  const response = await fetch(`${API_BASE_URL}/occupancy`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getOccupancyHistory = async (parkingSpaceId: string) => {
  const response = await fetch(`${API_BASE_URL}/occupancy/history/${parkingSpaceId}`);
  return response.json();
};

export const getAllOccupancyEvents = async () => {
  const response = await fetch(`${API_BASE_URL}/occupancy`);
  return response.json();
};

export const getOccupancyEventById = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/occupancy/event/${id}`);
  return response.json();
};

export const updateOccupancyEvent = async (id: string, status: string) => {
  const response = await fetch(`${API_BASE_URL}/occupancy/event/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
  return response.json();
};

export const deleteOccupancyEvent = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/occupancy/event/${id}`, {
    method: "DELETE",
  });
  return response.json();
};
