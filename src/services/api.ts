const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  public getToken(): string | null {
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
  public register(data: { fullName: string; email: string; password: string; studentId: string; department?: string; phone?: string }) {
    return this.request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public login(data: { email: string; password: string }) {
    return this.request<{ message: string; token: string; user: any }>('/auth/login', {
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

  // --- Admin endpoints ---
  public adminLogin(data: { email: string; password: string }) {
    return this.request<{ message: string; token: string; user: any }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public getAdminStats() {
    return this.request<{ stats: any; recentReports: any[]; auditLog: any[] }>('/admin/stats');
  }

  public getAdminUsers() {
    return this.request<{ users: any[] }>('/admin/users');
  }

  public adminUpdateReportStatus(reportId: string, status: string, adminNotes?: string) {
    return this.request<{ message: string; report: any }>(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    });
  }

  // --- S3 Presign endpoint ---
  public getPresignedUpload(filename: string, contentType: string, isPrivateEvidence: boolean = false) {
    return this.request<{ uploadUrl: string; publicUrl: string; key: string }>('/upload/presign', {
      method: 'POST',
      body: JSON.stringify({ filename, contentType, isPrivateEvidence }),
    });
  }
}

export const api = new ApiClient();
