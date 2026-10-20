const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('cf_auth_token');
  }

  public setToken(token: string): void {
    localStorage.setItem('cf_auth_token', token);
  }

  public removeToken(): void {
    localStorage.removeItem('cf_auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // --- Auth endpoints ---
  public register(data: any) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public login(data: any) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public getProfile() {
    return this.request<{ user: any }>('/auth/profile');
  }

  // --- Reports endpoints ---
  public getReports(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request<{ data: any[]; pagination: any }>(`/reports${query ? `?${query}` : ''}`);
  }

  public getReportById(id: string) {
    return this.request<{ report: any }>(`/reports/${id}`);
  }

  public createReport(data: any) {
    return this.request<{ message: string; report: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Claims endpoints ---
  public getClaims() {
    return this.request<{ claims: any[] }>('/claims');
  }

  public submitClaim(reportId: string, proofDetails: string) {
    return this.request<{ message: string; claim: any }>('/claims', {
      method: 'POST',
      body: JSON.stringify({ reportId, proofDetails }),
    });
  }

  public reviewClaim(claimId: string, status: string, adminNotes?: string) {
    return this.request<{ message: string; claim: any }>(`/claims/${claimId}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // --- S3 Presign endpoint ---
  public getPresignedUpload(filename: string, contentType: string) {
    return this.request<{ uploadUrl: string; publicUrl: string; key: string }>('/upload/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType }),
    });
  }
}

export const api = new ApiClient();
