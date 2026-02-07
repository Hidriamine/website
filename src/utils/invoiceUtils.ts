import dayjs from 'dayjs';
import { LigneFacture, MontantsFacture, Facture, ValidationResult, Salarie, StatutFacture } from '../types';

// Calculer les montants d'une facture
export const calculerMontantsFacture = (lignes: LigneFacture[], tauxTVA: number = 20): MontantsFacture => {
  const totalHT = lignes.reduce((sum, ligne) => sum + ligne.montantHT, 0);
  const montantTVA = Math.round(totalHT * (tauxTVA / 100) * 100) / 100;
  const totalTTC = Math.round((totalHT + montantTVA) * 100) / 100;

  return {
    totalHT: Math.round(totalHT * 100) / 100,
    montantTVA,
    totalTTC,
  };
};

// Calculer une ligne de facture
export const calculerLigneFacture = (quantite: number, prixUnitaire: number): number => {
  return Math.round(quantite * prixUnitaire * 100) / 100;
};

// Calculer la date d'échéance
export const calculerDateEcheance = (dateEmission: string, delaiJours: number): string => {
  return dayjs(dateEmission).add(delaiJours, 'day').format('YYYY-MM-DD');
};

// Générer des lignes de facture à partir des salariés
export const genererLignesFacture = (salaries: Salarie[]): LigneFacture[] => {
  return salaries.map((salarie, index) => ({
    id: String(index + 1),
    designation: salarie.poste,  // Désignation = Poste du salarié
    quantite: 0, // À remplir par l'utilisateur (nombre de jours)
    prixUnitaire: salarie.tauxJournalier,
    montantHT: 0,
  }));
};

// Formater un montant en euros
export const formaterMontant = (montant: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(montant);
};

// Formater un montant en euros pour PDF (sans caractères spéciaux)
export const formaterMontantPDF = (montant: number): string => {
  const montantFormate = montant.toFixed(2).replace('.', ',');
  return `${montantFormate} EUR`;
};

// Valider une facture
export const validerFacture = (facture: Partial<Facture>): ValidationResult => {
  const erreurs: string[] = [];

  if (!facture.clientId) {
    erreurs.push('Le client est obligatoire');
  }

  if (!facture.lignes || facture.lignes.length === 0) {
    erreurs.push('Au moins une ligne est requise');
  }

  if (facture.lignes) {
    facture.lignes.forEach((ligne, index) => {
      if (!ligne.designation) {
        erreurs.push(`Ligne ${index + 1}: La désignation est obligatoire`);
      }
      if (!ligne.quantite || ligne.quantite <= 0) {
        erreurs.push(`Ligne ${index + 1}: La quantité doit être supérieure à 0`);
      }
      if (!ligne.prixUnitaire || ligne.prixUnitaire <= 0) {
        erreurs.push(`Ligne ${index + 1}: Le prix unitaire doit être supérieur à 0`);
      }
    });
  }

  return {
    valide: erreurs.length === 0,
    erreurs,
  };
};

// Obtenir le statut en français
export const getStatutLabel = (statut: StatutFacture): string => {
  const statuts: Record<StatutFacture, string> = {
    brouillon: 'Brouillon',
    envoyee: 'Envoyée',
    payee: 'Payée',
    non_payee: 'Non payée',
    annulee: 'Annulée',
  };
  return statuts[statut] || statut;
};

// Obtenir la couleur du statut pour Ant Design
export const getStatutColor = (statut: StatutFacture): string => {
  const couleurs: Record<StatutFacture, string> = {
    brouillon: 'default',
    envoyee: 'processing',
    payee: 'success',
    non_payee: 'error',
    annulee: 'default',
  };
  return couleurs[statut] || 'default';
};

// Vérifier si une facture est en retard
export const estEnRetard = (facture: Facture): boolean => {
  if (facture.statut === 'payee' || facture.statut === 'annulee') {
    return false;
  }
  const aujourdhui = dayjs();
  const dateEcheance = dayjs(facture.dateEcheance);
  return aujourdhui.isAfter(dateEcheance);
};

// Obtenir toutes les factures en retard
export const getFacturesEnRetard = (factures: Facture[]): Facture[] => {
  return factures.filter(facture => estEnRetard(facture));
};

// Obtenir les salariés sans facture pour un mois donné
export const getSalariesSansFactureDuMois = (
  salaries: Salarie[],
  factures: Facture[],
  mois: string // Format: 'YYYY-MM'
): Salarie[] => {
  return salaries.filter(salarie => {
    // Récupérer toutes les factures du client pour le mois spécifié
    const facturesClientDuMois = factures.filter(facture => {
      const dateEmissionMois = dayjs(facture.dateEmission).format('YYYY-MM');
      return facture.clientId === salarie.clientId && dateEmissionMois === mois;
    });

    // Si aucune facture n'existe pour ce client ce mois-ci, inclure le salarié
    return facturesClientDuMois.length === 0;
  });
};