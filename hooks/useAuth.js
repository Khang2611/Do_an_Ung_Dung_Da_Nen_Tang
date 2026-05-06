import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USER } from '../constants/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, password) => {
    setUser(MOCK_USER);
    return true;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
