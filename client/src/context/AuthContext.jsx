import { createContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi, getMe } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hergod_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hergod_token');

    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('hergod_token');
          localStorage.removeItem('hergod_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await loginApi({ email, password });

    localStorage.setItem('hergod_token', data.token);
    localStorage.setItem('hergod_user', JSON.stringify(data));

    if (data.sosToken) {
      localStorage.setItem('hergod_sos_token', data.sosToken);
    }

    setUser(data);
    return data;
  };

  const register = async (form) => {
    const data = await registerApi(form);

    // Registration creates the account and SOS token, but does not
    // automatically sign the user in. The user continues to the
    // Emergency SOS Token page and then signs in normally.
    localStorage.removeItem('hergod_token');
    localStorage.removeItem('hergod_user');

    if (data.sosToken) {
      localStorage.setItem('hergod_sos_token', data.sosToken);
    }

    setUser(null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('hergod_token');
    localStorage.removeItem('hergod_user');

    // Keep the SOS token so Emergency SOS remains available from
    // the Login page after logout.
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
