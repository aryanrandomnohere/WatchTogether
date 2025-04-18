// src/hooks/useAuth.ts
import { useRecoilState } from 'recoil';

import { isAuthenticatedState } from '../State/authState';

function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useRecoilState(isAuthenticatedState);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}

export default useAuth;
