import api from "./axios";

export const getHomeZones = async () => {
  const response = await api.get("/zones");
  return response.data;
};

export const getHomeStates = async () => {
  const response = await api.get("/states");
  return response.data;
};

export const getHomeCities = async () => {
  const response = await api.get("/cities");
  return response.data;
};

export const getHomePlaces = async () => {
  const response = await api.get("/places");
  return response.data;
};

export const getHomeHotels = async () => {
  const response = await api.get("/hotels");
  return response.data;
};