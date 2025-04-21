import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  message?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const verifyToken = async (token: string) => {
    try {
      // Simular llamada al backend para verificar el token
      const response = await new Promise<AuthResponse>((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            user: {
              id: 1,
              name: 'Usuario Demo',
              email: 'demo@example.com'
            }
          });
        }, 1000);
      });

      if (response.success && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        localStorage.setItem('authToken', token);
        
        // Si estamos en la página de login, redirigir al dashboard
        if (location.pathname === '/signin') {
          navigate('/');
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar token en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      verifyToken(token);
    } else {
      // Si no hay token, verificar si hay uno en localStorage
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        verifyToken(storedToken);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  const login = (token: string) => {
    setIsLoading(true);
    verifyToken(token);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('authToken');
    navigate('/signin');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 