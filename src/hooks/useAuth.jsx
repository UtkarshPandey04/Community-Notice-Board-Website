import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    // Remove from localStorage
    localStorage.removeItem('communityUser');
    // Redirect to home page
    window.location.href = '/';
  }, []);

  useEffect(() => {
    const validateUser = async () => {
      const storedUser = localStorage.getItem('communityUser');
      if (storedUser) {
        // It's good practice to rename the parsed user to avoid shadowing the `user` state
        const parsedUser = JSON.parse(storedUser);
        try {
          const res = await fetch('/api/auth/validate-token', {
            headers: {
              Authorization: `Bearer ${parsedUser.token}`,
            },
          });
          if (res.ok) {
            setUser(parsedUser);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Token validation failed', error);
          logout();
        }
      }
      setLoading(false);
    };

    validateUser();
  }, [logout]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const userWithAuth = {
          ...data.user,
          isAuthenticated: true,
          token: data.token,
        };
        setUser(userWithAuth);
        localStorage.setItem('communityUser', JSON.stringify(userWithAuth));
        return { success: true, message: data.message };
      } else {
        const errorData = await res.json();
        let errorMessage = errorData.message || 'Login failed';
        let userNotFound = false;

        // Customize error message for user not found
        if (res.status === 401 && errorData.message === 'Invalid credentials') {
          errorMessage = 'User not registered. Please sign up first.';
          userNotFound = true;
        }

        return {
          success: false,
          message: errorMessage,
          userNotFound: userNotFound,
        };
      }
    } catch (error) {
      console.error('Login failed', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }, []);

  const signup = useCallback(async (email, password, firstName, lastName, role = 'user') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, firstName, lastName, role }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          message: data.message,
          user: data.user,
          token: data.token,
        };
      } else {
        const errorData = await res.json();
        console.log('❌ Backend error response:', errorData);
        return {
          success: false,
          message: errorData.message || errorData.error || 'Registration failed',
          details: errorData.details || null,
        };
      }
    } catch (error) {
      console.error('Signup failed', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, token: data.token };
        setUser(updatedUser);
        localStorage.setItem('communityUser', JSON.stringify(updatedUser));
        return { success: true, message: data.message, token: data.token };
      } else {
        // Token refresh failed, logout user
        logout();
        return { success: false, message: 'Session expired. Please login again.' };
      }
    } catch (error) {
      console.error('Token refresh failed', error);
      logout();
      return {
        success: false,
        message: 'Network error. Please login again.',
      };
    }
  }, [user, logout]);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    let token = user?.token;

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Check if token is expired (or close to expiring, e.g., within the next 60 seconds)
        const isExpired = decodedToken.exp * 1000 < Date.now() + 60000;

        if (isExpired) {
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            token = refreshResult.token;
          } else {
            // If refresh fails, throw an error to stop the request
            throw new Error('Session expired. Please log in again.');
          }
        }
      } catch (error) {
        // This can happen if the token is invalid. Logout the user.
        console.error("Invalid token:", error);
        logout();
        throw new Error('Invalid session. Please log in again.');
      }
    }

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const finalOptions = {
      ...options,
      headers: { ...options.headers, ...authHeaders },
    };

    return fetch(url, finalOptions);
  }, [user, refreshToken, logout]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const res = await fetchWithAuth('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(currentUser => {
          const updatedUser = { ...currentUser, ...data.user };
          localStorage.setItem('communityUser', JSON.stringify(updatedUser));
          return updatedUser;
        });
        return { success: true, message: data.message };
      } else {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.message || 'Profile update failed',
        };
      }
    } catch (error) {
      console.error('Profile update failed', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }, [fetchWithAuth]);
  const uploadProfilePicture = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const updateResult = await updateProfile({ profilePicture: data.url });
        if (updateResult.success) {
          return { success: true, profilePictureUrl: data.url };
        }
        return {
          success: false,
          message: updateResult.message || 'Failed to update profile with new picture.',
        };
      }

      return { success: false, message: data.message || 'Profile picture upload failed' };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, [fetchWithAuth, updateProfile]);
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const res = await fetchWithAuth('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, message: data.message };
      } else {
        const errorData = await res.json();
        return {
          success: false,
          message: errorData.message || 'Password change failed',
        };
      }
    } catch (error) {
      console.error('Password change failed', error);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  }, [fetchWithAuth]);

  const getAuthHeaders = useCallback(() => {
    const token = user?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [user]);

  const value = {
    user,
    login,
    logout,
    loading,
    signup,
    updateProfile,
    uploadProfilePicture,
    changePassword,
    refreshToken,
    getAuthHeaders,
    fetchWithAuth,
    isAuthenticated: !!user?.isAuthenticated,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
