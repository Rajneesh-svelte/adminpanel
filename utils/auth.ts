// utils/auth.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  role_type?: string;
  // Add other user properties based on your API response
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: User;
  data?: any; // API returns `data`, accessed as response.data[0]
  // Add other properties based on your API response
}

// Cookie management utilities
export const cookies = {
  set: (name: string, value: string, days: number = 7) => {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    const isSecureContext = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isSecureContext ? '; Secure' : '';
    const sameSite = 'Lax';
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=${sameSite}${secureFlag}`;
  },

  get: (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  remove: (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },
};

// Authentication API functions
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch('https://beta.homeivf.in/user/api/v1/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    cookies.remove('authToken');
    cookies.remove('userData');
    // Redirect to login page
    window.location.href = '/login';
  },

  getToken: (): string | null => {
    return cookies.get('authToken');
  },

  getUser: (): User | null => {
    const userData = cookies.get('userData');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  isAuthenticated: (): boolean => {
    return !!cookies.get('authToken');
  },
};

// HTTP client with authentication
export const apiClient = {
  get: async (url: string) => {
    const token = authAPI.getToken();
    const response = await fetch(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      authAPI.logout();
      return;
    }

    return response.json();
  },

  post: async (url: string, data: any) => {
    const token = authAPI.getToken();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      authAPI.logout();
      return;
    }

    return response.json();
  },

  patch: async (url: string, data: any) => {
    const token = authAPI.getToken();
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      authAPI.logout();
      return;
    }

    return response.json();
  },
};
