import api from "./axios";

const extractData = (response) => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.zones)) {
    return response.data.zones;
  }

  if (Array.isArray(response.data?.states)) {
    return response.data.states;
  }

  if (Array.isArray(response.data?.cities)) {
    return response.data.cities;
  }

  if (Array.isArray(response.data?.places)) {
    return response.data.places;
  }

  return [];
};

export const getZones = async () => {
  const response = await api.get("/zones");
  return extractData(response);
};

export const getStatesByZone = async (zoneId) => {
  const response = await api.get(`/zones/${zoneId}/states`);
  return extractData(response);
};

export const getCitiesByState = async (stateId) => {
  const response = await api.get(`/states/${stateId}/cities`);
  return extractData(response);
};

export const getAllStates = async () => {
  const response = await api.get("/states");
  return extractData(response);
};

export const getAllCities = async () => {
  const response = await api.get("/cities");
  return extractData(response);
};

export const getAllPlaces = async () => {
  const response = await api.get("/places");
  return extractData(response);
};

export const getPlacesByCity = async (cityId) => {
  const response = await api.get(`/cities/${cityId}/places`);
  return extractData(response);
};