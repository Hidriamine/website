// Types pour l'entreprise
export interface Entreprise {
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  siret: string;
  email: string;
  telephone: string;
  iban: string;
  bic: string;
}

// Types pour les clients
export interface Client {
  id: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
  email: string;
  siret: string;
  delaiFacturation: number;
}

// Types pour les salariés
export interface Salarie {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string; // Numéro de téléphone pour les rappels SMS
  tauxJournalier: number;
  clientId: string;
  poste: string;
  reference?: string; // Référence du salarié
}

// Types pour les lignes de facture
export interface LigneFacture {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montantHT: number;
}

// Types pour les factures
export type StatutFacture = 'brouillon' | 'envoyee' | 'payee' | 'non_payee' | 'annulee';

export interface Facture {
  id: string;
  numero: string;
  reference?: string;
  clientId: string;
  dateEmission: string;
  dateEcheance: string;
  lignes: LigneFacture[];
  totalHT: number;
  tauxTVA: number;
  montantTVA: number;
  totalTTC: number;
  statut: StatutFacture;
  //reference?: string; // Référence du salarié
}

// Types pour les statistiques
export interface Statistiques {
  nombreClients: number;
  nombreSalaries: number;
  nombreFactures: number;
  totalHT: string;
  totalTTC: string;
}

// Types pour le DataContext
export interface DataContextType {
  // Entreprise
  entreprise: Entreprise | null;
  
  // Clients
  clients: Client[];
  ajouterClient: (client: Omit<Client, 'id'>) => Client;
  modifierClient: (id: string, client: Partial<Omit<Client, 'id'>>) => void;
  supprimerClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  
  // Salariés
  salaries: Salarie[];
  ajouterSalarie: (salarie: Omit<Salarie, 'id'>) => Salarie;
  modifierSalarie: (id: string, salarie: Partial<Omit<Salarie, 'id'>>) => void;
  supprimerSalarie: (id: string) => void;
  getSalariesByClientId: (clientId: string) => Salarie[];
  
  // Factures
  factures: Facture[];
  ajouterFacture: (facture: Omit<Facture, 'id' | 'numero'>) => Facture;
  modifierFacture: (id: string, facture: Partial<Omit<Facture, 'id' | 'numero'>>) => void;
  supprimerFacture: (id: string) => void;
  getFactureById: (id: string) => Facture | undefined;
  getFacturesByClientId: (clientId: string) => Facture[];
  genererNumeroFacture: () => string;
  
  // Statistiques
  getStatistiques: () => Statistiques;
  getDernieresFactures: (limit?: number) => Facture[];
  getSalariesSansFactureDuMois: (mois: string) => Salarie[];

  // Sauvegarde
  sauvegarderDonnees: () => void;
}

// Types pour les montants calculés
export interface MontantsFacture {
  totalHT: number;
  montantTVA: number;
  totalTTC: number;
}

// Types pour la validation
export interface ValidationResult {
  valide: boolean;
  erreurs: string[];
}