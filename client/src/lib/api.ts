const TOKEN_KEY = 'sipjok_token';

/**
 * API Client for making authenticated requests to the backend.
 * The JWT is issued by POST /api/auth/login and stored in localStorage.
 */
class ApiClient {
  private baseURL: string;

  constructor() {
    // Use relative URL for API calls (same origin)
    this.baseURL = '/api';
  }

  // ------------------------------------------------------------------
  // Token management (localStorage)
  // ------------------------------------------------------------------
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Make HTTP request with automatic token injection
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }

    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      // Session expired / revoked → drop token so ProtectedRoute sends us to login
      if (response.status === 401) {
        this.clearToken();
        if (!window.location.pathname.startsWith('/login')) {
          window.location.assign('/login');
        }
      }

      const errorData = await response.json().catch(() => ({
        error: 'Request failed',
        message: response.statusText,
      }));

      throw new Error(errorData.message || errorData.error || 'Request failed');
    }

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Upload a file as multipart/form-data (server saves it on local disk)
   */
  async upload<T = any>(endpoint: string, file: File, field = 'file'): Promise<T> {
    const token = this.getToken();
    if (!token) {
      throw new Error('Not authenticated. Please log in.');
    }

    const formData = new FormData();
    formData.append(field, file);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Upload failed',
        message: response.statusText,
      }));
      throw new Error(errorData.message || errorData.error || 'Upload failed');
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * GET request with query parameters
   */
  async getWithParams<T = any>(
    endpoint: string,
    params: Record<string, any>
  ): Promise<T> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null)
        .map(([key, value]) => [key, String(value)])
    ).toString();

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.get<T>(url);
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing
export { ApiClient };
