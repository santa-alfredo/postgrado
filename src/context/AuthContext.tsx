import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import axiosInstance from '../services/axiosInstance';


interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const setTokenFromUrl = async (token: string) => {
    try {
      console.log('Estableciendo token desde URL', token);
      const response = await axiosInstance.post('/auth/set-token', { token });

      if (response.status === 200) {
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());

        await verifyToken();
      } else {
        throw new Error('Error al establecer el token');
      }
    } catch (error) {
      console.error('Error al establecer token:', error);
      setIsAuthenticated(false);
      setUser(null);
      navigate('/signin');
    }
  };

  const verifyToken = async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      
      if (response.status === 200) {
        const data = response.data as { user: User };
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('Token inválido o no existe, redirigiendo a /signin en verifytokenen');
        // JWT inválido o no existe, redirige a /signin
        setIsAuthenticated(false);
        setUser(null);
        navigate('/signin');
      } else {
        // Otros errores (por ejemplo, problemas de red, 500, etc.)
        console.error('Error al verificar token:', error);
        setIsAuthenticated(false);
        setUser(null);
        // Opcional: no redirigir para otros errores, o manejar de otra forma
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post('/auth/login', { email, password });

      if (response.status === 200) {
        const data = response.data as { user: User };
        setIsAuthenticated(true);
        setUser(data.user);
        // navigate('/ficha');
      } else {
        throw new Error('Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      navigate('/signin');
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    
    if (token) {
      setTokenFromUrl(token);
    } else {
      verifyToken();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
} 