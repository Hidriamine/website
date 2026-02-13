import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, Salarie, Facture, Entreprise, DataContextType, Statistiques } from '../types';
import { getSalariesSansFactureDuMois } from '../utils/invoiceUtils';
import { entrepriseApi, clientsApi, salariesApi, facturesApi } from '../services/apiClient';
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

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [entrepriseData, clientsData, salariesData, facturesData] = await Promise.all([
          entrepriseApi.get(),
          clientsApi.getAll(),
          salariesApi.getAll(),
          facturesApi.getAll(),
        ]);

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
    const nouveauClient = await clientsApi.create(client);
    setClients([...clients, nouveauClient]);
    return nouveauClient;
  };

  const modifierClient = async (id: string, clientModifie: Partial<Omit<Client, 'id'>>): Promise<void> => {
    const clientMisAJour = await clientsApi.update(id, clientModifie);
    setClients(clients.map(c => c.id === id ? clientMisAJour : c));
  };

  const supprimerClient = async (id: string): Promise<void> => {
    await clientsApi.delete(id);
    setClients(clients.filter(c => c.id !== id));
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(c => c.id === id);
  };

  // ============ SALARIES ============
  const ajouterSalarie = async (salarie: Omit<Salarie, 'id'>): Promise<Salarie> => {
    const nouveauSalarie = await salariesApi.create(salarie);
    setSalaries([...salaries, nouveauSalarie]);
    return nouveauSalarie;
  };

  const modifierSalarie = async (id: string, salarieModifie: Partial<Omit<Salarie, 'id'>>): Promise<void> => {
    const salarieMisAJour = await salariesApi.update(id, salarieModifie);
    setSalaries(salaries.map(s => s.id === id ? salarieMisAJour : s));
  };

  const supprimerSalarie = async (id: string): Promise<void> => {
    await salariesApi.delete(id);
    setSalaries(salaries.filter(s => s.id !== id));
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
    const nouvelleFacture = await facturesApi.create(facture);
    setFactures([...factures, nouvelleFacture]);
    return nouvelleFacture;
  };

  const modifierFacture = async (id: string, factureModifiee: Partial<Omit<Facture, 'id' | 'numero'>>): Promise<void> => {
    const factureMiseAJour = await facturesApi.update(id, factureModifiee);
    setFactures(factures.map(f => f.id === id ? factureMiseAJour : f));
  };

  const supprimerFacture = async (id: string): Promise<void> => {
    await facturesApi.delete(id);
    setFactures(factures.filter(f => f.id !== id));
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

  const sauvegarderDonnees = (): void => {
    console.log('Les données sont automatiquement sauvegardées dans les fichiers JSON');
  };

  const value: DataContextType = {
    entreprise,
    clients,
    ajouterClient,
    modifierClient,
    supprimerClient,
    getClientById,
    salaries,
    ajouterSalarie,
    modifierSalarie,
    supprimerSalarie,
    getSalariesByClientId,
    factures,
    ajouterFacture,
    modifierFacture,
    supprimerFacture,
    getFactureById,
    getFacturesByClientId,
    genererNumeroFacture,
    getStatistiques,
    getDernieresFactures,
    getSalariesSansFactureDuMois: getSalariesSansFactureDuMoisContext,
    sauvegarderDonnees,
  };

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
