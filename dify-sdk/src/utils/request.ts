import axios from 'axios';

export const createAxiosInstance = (apiKey: string, baseUrl: string) => {
  const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 50000,
  });

  axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${apiKey}`;
    return config;
  });

  return axiosInstance;
};
