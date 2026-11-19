import {
  createContext,
  useContext,
  useState
} from 'react';

import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());

  const login = async (email, password) => {
    const loggedInUser = await authService.login(email, password);

    setUser(loggedInUser);

    return loggedInUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAuthenticated = Boolean(
    user && authService.isAuthenticated()
  );

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}