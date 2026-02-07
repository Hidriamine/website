// ALTERNATIVE VERSION - Si la version principale ne fonctionne pas
// Remplacer le contenu de InvoicePdfExporter.tsx par ce fichier

import pdfMake from 'pdfmake/build/pdfmake';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { Facture, Client } from '../../types';
import { formaterMontant } from '../../utils/invoiceUtils';
import dayjs from 'dayjs';

// Configuration des fonts de manière sécurisée
const initializePdfMake = (): void => {
  try {
    // Tentative d'import des fonts
    const pdfFonts = require('pdfmake/build/vfs_fonts');
    
    // Gestion des différentes structures possibles
    if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
      (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    } else if (pdfFonts.vfs) {
      (pdfMake as any).vfs = pdfFonts.vfs;
    } else {
      console.warn('VFS fonts structure non reconnue, utilisation des fonts par défaut');
    }
  } catch (error) {
    console.warn('Impossible de charger les fonts VFS, utilisation des fonts par défaut', error);
  }
};

// Initialiser une seule fois
initializePdfMake();

export const exporterFacturePDF = (facture: Facture, client: Client): void => {
  // Informations de l'entreprise émettrice (à personnaliser)
  const entreprise = {
    nom: 'NEXGENSYS',
    adresse: '14 rue pierre Lhomme',
    codePostal: '92400',
    ville: 'Courbevoie',
    siret: '98374713000018',
    email: 'contact@nexgensys.fr',
    telephone: '07 78 56 12 55',
  };

  // Préparation des lignes du tableau
  const lignesTableau = facture.lignes.map(ligne => [
    { text: ligne.designation, style: 'tableCell' },
    { text: ligne.quantite.toString(), style: 'tableCellRight' },
    { text: formaterMontant(ligne.prixUnitaire), style: 'tableCellRight' },
    { text: formaterMontant(ligne.montantHT), style: 'tableCellRight', bold: true },
  ]);

  // Définition du document PDF
  const documentDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    
    content: [
      // En-tête
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: entreprise.nom, style: 'companyName' },
              { text: entreprise.adresse, style: 'companyInfo' },
              { text: `${entreprise.codePostal} ${entreprise.ville}`, style: 'companyInfo' },
              { text: `SIRET: ${entreprise.siret}`, style: 'companyInfo', margin: [0, 5, 0, 0] },
              { text: `Email: ${entreprise.email}`, style: 'companyInfo' },
              { text: `Tél: ${entreprise.telephone}`, style: 'companyInfo' },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'FACTURE', style: 'invoiceTitle' },
              { text: facture.numero, style: 'invoiceNumber' },
            ],
          },
        ],
        margin: [0, 0, 0, 30],
      },

      // Informations client
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'Facturé à:', style: 'sectionHeader' },
              { text: client.nom, style: 'clientName' },
              { text: client.adresse, style: 'clientInfo' },
              { text: `${client.codePostal} ${client.ville}`, style: 'clientInfo' },
              { text: `SIRET: ${client.siret}`, style: 'clientInfo', margin: [0, 5, 0, 0] },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'Date d\'émission:', style: 'dateLabel' },
              { text: dayjs(facture.dateEmission).format('DD/MM/YYYY'), style: 'dateValue' },
              { text: 'Date d\'échéance:', style: 'dateLabel', margin: [0, 10, 0, 0] },
              { text: dayjs(facture.dateEcheance).format('DD/MM/YYYY'), style: 'dateValue' },
            ],
          },
        ],
        margin: [0, 0, 0, 30],
      },

      // Tableau des prestations
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Désignation', style: 'tableHeader' },
              { text: 'Quantité', style: 'tableHeader', alignment: 'right' },
              { text: 'Prix unitaire', style: 'tableHeader', alignment: 'right' },
              { text: 'Montant HT', style: 'tableHeader', alignment: 'right' },
            ],
            ...lignesTableau,
          ],
        },
        layout: {
          fillColor: (rowIndex) => (rowIndex === 0 ? '#f0f0f0' : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#cccccc',
          vLineColor: () => '#cccccc',
        },
        margin: [0, 0, 0, 20],
      },

      // Totaux
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Total HT', style: 'totalLabel' },
                  { text: formaterMontant(facture.totalHT), style: 'totalValue' },
                ],
                [
                  { text: `TVA (${facture.tauxTVA}%)`, style: 'totalLabel' },
                  { text: formaterMontant(facture.montantTVA), style: 'totalValue' },
                ],
                [
                  { text: 'Total TTC', style: 'totalLabelFinal', bold: true },
                  { text: formaterMontant(facture.totalTTC), style: 'totalValueFinal', bold: true },
                ],
              ],
            },
            layout: 'noBorders',
          },
        ],
        margin: [0, 0, 0, 40],
      },

      // Mentions légales
      {
        text: [
          { text: 'Conditions de paiement: ', bold: true },
          { text: `Paiement à ${client.delaiFacturation} jours\n` },
          { text: 'En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée, ainsi qu\'une indemnité forfaitaire pour frais de recouvrement de 40 euros.\n\n' },
          { text: 'Le règlement sera réalisé en Euros par virement bancaire ou par chèque. Membre d’un centre de gestion agréé, le règlement par chèque est accepté' },
        ],
        style: 'footer',
      },
    ] as Content,

    // Styles
    styles: {
      companyName: {
        fontSize: 18,
        bold: true,
        color: '#1890ff',
      },
      companyInfo: {
        fontSize: 10,
        color: '#666',
      },
      invoiceTitle: {
        fontSize: 28,
        bold: true,
        color: '#1890ff',
        alignment: 'right',
      },
      invoiceNumber: {
        fontSize: 14,
        color: '#666',
        alignment: 'right',
        margin: [0, 5, 0, 0],
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      clientName: {
        fontSize: 14,
        bold: true,
        margin: [0, 0, 0, 2],
      },
      clientInfo: {
        fontSize: 10,
        color: '#666',
      },
      dateLabel: {
        fontSize: 10,
        color: '#666',
      },
      dateValue: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        fontSize: 11,
        bold: true,
        fillColor: '#f0f0f0',
        margin: [5, 5, 5, 5],
      },
      tableCell: {
        fontSize: 10,
        margin: [5, 5, 5, 5],
      },
      tableCellRight: {
        fontSize: 10,
        alignment: 'right',
        margin: [5, 5, 5, 5],
      },
      totalLabel: {
        fontSize: 11,
        alignment: 'right',
        margin: [0, 2, 10, 2],
      },
      totalValue: {
        fontSize: 11,
        alignment: 'right',
        margin: [0, 2, 0, 2],
      },
      totalLabelFinal: {
        fontSize: 13,
        alignment: 'right',
        margin: [0, 5, 10, 5],
        color: '#1890ff',
      },
      totalValueFinal: {
        fontSize: 13,
        alignment: 'right',
        margin: [0, 5, 0, 5],
        color: '#1890ff',
      },
      footer: {
        fontSize: 8,
        color: '#666',
        italics: true,
      },
    },

    defaultStyle: {
      font: 'Roboto',
    },
  };

  // Génération et téléchargement du PDF
  try {
    // Nettoyer le nom du client pour le nom de fichier (retirer les caractères spéciaux)
    const nomClientNettoye = client.nom.replace(/[/\\?%*:|"<>]/g, '-');
    // Extraire l'année et le mois de la date d'émission
    const dateEmission = dayjs(facture.dateEmission);
    const annee = dateEmission.format('YYYY');
    const mois = dateEmission.format('MM');
    const nomFichier = `Facture_FAC-${annee}-${mois}-${nomClientNettoye}.pdf`;
    pdfMake.createPdf(documentDefinition).download(nomFichier);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF. Veuillez vérifier la console.');
  }
};