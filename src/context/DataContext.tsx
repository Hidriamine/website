import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Salarie, Facture, Entreprise, DataContextType, Statistiques } from '../types';
import { getSalariesSansFactureDuMois } from '../utils/invoiceUtils';
import { API_BASE_URL } from '../config';
import { INVOICE_PREFIX, INVOICE_NUMBER_PADDING } from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData doit être utilisé dans un DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [salaries, setSalaries] = useState<Salarie[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger les données depuis l'API au démarrage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Charger toutes les données en parallèle
        const [entrepriseRes, clientsRes, salariesRes, facturesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/entreprise`),
          fetch(`${API_BASE_URL}/clients`),
          fetch(`${API_BASE_URL}/salaries`),
          fetch(`${API_BASE_URL}/factures`),
        ]);

        const entrepriseData = await entrepriseRes.json();
        const clientsData = await clientsRes.json();
        const salariesData = await salariesRes.json();
        const facturesData = await facturesRes.json();

        setEntreprise(entrepriseData);
        setClients(clientsData);
        setSalaries(salariesData);
        setFactures(facturesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ============ CLIENTS ============
  const ajouterClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(client),
      });

      const nouveauClient = await response.json();
      setClients([...clients, nouveauClient]);
      return nouveauClient;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
      throw error;
    }
  };

  const modifierClient = async (id: string, clientModifie: Partial<Omit<Client, 'id'>>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientModifie),
      });

      const clientMisAJour = await response.json();
      setClients(clients.map(c => c.id === id ? clientMisAJour : c));
    } catch (error) {
      console.error('Erreur lors de la modification du client:', error);
      throw error;
    }
  };

  const supprimerClient = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });

      setClients(clients.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      throw error;
    }
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(c => c.id === id);
  };

  // ============ SALARIES ============
  const ajouterSalarie = async (salarie: Omit<Salarie, 'id'>): Promise<Salarie> => {
    try {
      const response = await fetch(`${API_BASE_URL}/salaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salarie),
      });

      const nouveauSalarie = await response.json();
      setSalaries([...salaries, nouveauSalarie]);
      return nouveauSalarie;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du salarié:', error);
      throw error;
    }
  };

  const modifierSalarie = async (id: string, salarieModifie: Partial<Omit<Salarie, 'id'>>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/salaries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salarieModifie),
      });

      const salarieMisAJour = await response.json();
      setSalaries(salaries.map(s => s.id === id ? salarieMisAJour : s));
    } catch (error) {
      console.error('Erreur lors de la modification du salarié:', error);
      throw error;
    }
  };

  const supprimerSalarie = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/salaries/${id}`, {
        method: 'DELETE',
      });

      setSalaries(salaries.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du salarié:', error);
      throw error;
    }
  };

  const getSalariesByClientId = (clientId: string): Salarie[] => {
    return salaries.filter(s => s.clientId === clientId);
  };

  // ============ FACTURES ============
  const genererNumeroFacture = (): string => {
    const annee = new Date().getFullYear();
    const nombreFactures = factures.length;
    const numero = String(nombreFactures + 1).padStart(INVOICE_NUMBER_PADDING, '0');
    return `${INVOICE_PREFIX}-${annee}-${numero}`;
  };

  const ajouterFacture = async (facture: Omit<Facture, 'id' | 'numero'>): Promise<Facture> => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facture),
      });

      const nouvelleFacture = await response.json();
      setFactures([...factures, nouvelleFacture]);
      return nouvelleFacture;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la facture:', error);
      throw error;
    }
  };

  const modifierFacture = async (id: string, factureModifiee: Partial<Omit<Facture, 'id' | 'numero'>>): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(factureModifiee),
      });

      const factureMiseAJour = await response.json();
      setFactures(factures.map(f => f.id === id ? factureMiseAJour : f));
    } catch (error) {
      console.error('Erreur lors de la modification de la facture:', error);
      throw error;
    }
  };

  const supprimerFacture = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/factures/${id}`, {
        method: 'DELETE',
      });

      setFactures(factures.filter(f => f.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      throw error;
    }
  };

  const getFactureById = (id: string): Facture | undefined => {
    return factures.find(f => f.id === id);
  };

  const getFacturesByClientId = (clientId: string): Facture[] => {
    return factures.filter(f => f.clientId === clientId);
  };

  // ============ STATISTIQUES ============
  const getStatistiques = (): Statistiques => {
    const totalHT = factures.reduce((sum, f) => sum + f.totalHT, 0);
    const totalTTC = factures.reduce((sum, f) => sum + f.totalTTC, 0);

    return {
      nombreClients: clients.length,
      nombreSalaries: salaries.length,
      nombreFactures: factures.length,
      totalHT: totalHT.toFixed(2),
      totalTTC: totalTTC.toFixed(2),
    };
  };

  const getDernieresFactures = (limit: number = 5): Facture[] => {
    return [...factures]
      .sort((a, b) => new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime())
      .slice(0, limit);
  };

  const getSalariesSansFactureDuMoisContext = (mois: string): Salarie[] => {
    return getSalariesSansFactureDuMois(salaries, factures, mois);
  };

  // Fonction de sauvegarde (non utilisée avec l'API mais maintenue pour compatibilité)
  const sauvegarderDonnees = (): void => {
    // Les données sont automatiquement sauvegardées par les API
    console.log('Les données sont automatiquement sauvegardées dans les fichiers JSON');
  };

  const value: DataContextType = {
    // Entreprise
    entreprise,

    // Clients
    clients,
    ajouterClient,
    modifierClient,
    supprimerClient,
    getClientById,

    // Salaries
    salaries,
    ajouterSalarie,
    modifierSalarie,
    supprimerSalarie,
    getSalariesByClientId,

    // Factures
    factures,
    ajouterFacture,
    modifierFacture,
    supprimerFacture,
    getFactureById,
    getFacturesByClientId,
    genererNumeroFacture,

    // Statistiques
    getStatistiques,
    getDernieresFactures,
    getSalariesSansFactureDuMois: getSalariesSansFactureDuMoisContext,

    // Sauvegarde
    sauvegarderDonnees,
  };

  // Afficher un loader pendant le chargement initial
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Chargement des données...
      </div>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};