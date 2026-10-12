import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('rentright_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('rentright_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          const data = await res.json();
          if (data.success && data.data) {
            setUser(data.data);
            setToken(storedToken);
          } else {
            // Token invalid or expired
            localStorage.removeItem('rentright_token');
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('Failed to restore auth session:', err);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user
   */
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || 'Login failed');
    }

    const { user: userData, token: authToken } = result.data;
    localStorage.setItem('rentright_token', authToken);
    setToken(authToken);
    setUser(userData);
    return userData;
  };

  /**
   * Register a new user
   */
  const register = async (userData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || 'Registration failed');
    }

    const { user: newUser, token: authToken } = result.data;
    localStorage.setItem('rentright_token', authToken);
    setToken(authToken);
    setUser(newUser);
    return newUser;
  };

  /**
   * Update current user profile
   */
  const updateProfile = async (updateData) => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
    const result = await res.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to update profile');
    }

    setUser(result.data);
    return result.data;
  };

  /**
   * Log out user
   */
  const logout = () => {
    localStorage.removeItem('rentright_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
