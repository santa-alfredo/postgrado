import axios from 'axios';
const API_BASE = import.meta.env.VITE_API_BASE;

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Incluye las cookies
});

// Estado para evitar redirecciones múltiples

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/postgrado/signin') {
        console.log('Redirigiendo a /postgrado/signin');
        window.location.href = '/postgrado/signin';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;