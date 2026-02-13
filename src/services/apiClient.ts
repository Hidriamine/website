import { API_BASE_URL } from '../config';
import { Client, Salarie, Facture, Entreprise } from '../types';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new ApiError(response.status, error.error || 'Erreur serveur');
  }

  return response.json();
}

// ============ AUTH ============

export const authApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; user: { id: string; email: string; nom: string } }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// ============ CRA ============

export const craApi = {
  validateToken: (token: string) =>
    request<{
      valide: boolean;
      raison?: string;
      salarie?: { nom: string; email: string; poste: string; reference: string };
      mois?: string;
      tauxJournalier?: number;
    }>(`/cra-token/${token}`),

  submitCRA: (token: string, joursTravailles: number) =>
    request<{ success: boolean; message: string; facture: any }>('/cra-saisie', {
      method: 'POST',
      body: JSON.stringify({ token, joursTravailles }),
    }),
};

// ============ ENTREPRISE ============

export const entrepriseApi = {
  get: () => request<Entreprise>('/entreprise'),
};

// ============ CLIENTS ============

export const clientsApi = {
  getAll: () => request<Client[]>('/clients'),

  create: (client: Omit<Client, 'id'>) =>
    request<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    }),

  update: (id: string, client: Partial<Omit<Client, 'id'>>) =>
    request<Client>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/clients/${id}`, {
      method: 'DELETE',
    }),
};

// ============ SALARIES ============

export const salariesApi = {
  getAll: () => request<Salarie[]>('/salaries'),

  create: (salarie: Omit<Salarie, 'id'>) =>
    request<Salarie>('/salaries', {
      method: 'POST',
      body: JSON.stringify(salarie),
    }),

  update: (id: string, salarie: Partial<Omit<Salarie, 'id'>>) =>
    request<Salarie>(`/salaries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(salarie),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/salaries/${id}`, {
      method: 'DELETE',
    }),
};

// ============ FACTURES ============

export const facturesApi = {
  getAll: () => request<Facture[]>('/factures'),

  create: (facture: Omit<Facture, 'id' | 'numero'>) =>
    request<Facture>('/factures', {
      method: 'POST',
      body: JSON.stringify(facture),
    }),

  update: (id: string, facture: Partial<Omit<Facture, 'id' | 'numero'>>) =>
    request<Facture>(`/factures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facture),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/factures/${id}`, {
      method: 'DELETE',
    }),

  sendEmail: (id: string) =>
    request<{ success: boolean; message: string; destinataire: string }>(`/factures/${id}/send-email`, {
      method: 'POST',
    }),
};
