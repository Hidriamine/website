import pdfMake from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import { penalites } from '../config/index.js';

// Configuration des fonts et locale
pdfMake.vfs = pdfFonts;
dayjs.locale('fr');

// Fonction pour formater les montants
const formaterMontantPDF = (montant) => {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(montant);

  // Remplacer les espaces Unicode spéciaux par des espaces normaux
  // pour éviter les problèmes d'encodage dans les PDFs
  return formatted.replace(/\u202F|\u00A0|\u2009/g, ' ');
};

/**
 * Génère un PDF de facture et retourne le buffer
 * @param {Object} facture - La facture à générer
 * @param {Object} client - Le client associé
 * @param {Object} entreprise - Les informations de l'entreprise
 * @returns {Promise<Buffer>} - Le buffer du PDF généré
 */
export const genererFacturePDF = (facture, client, entreprise) => {
  return new Promise((resolve, reject) => {
    try {
      // Préparation des lignes du tableau
      const lignesTableau = facture.lignes.map(ligne => [
        { text: ligne.designation, style: 'tableCell' },
        { text: ligne.quantite.toString(), style: 'tableCellRight' },
        { text: formaterMontantPDF(ligne.prixUnitaire), style: 'tableCellRight' },
        { text: formaterMontantPDF(ligne.montantHT), style: 'tableCellRight', bold: true },
      ]);

      // Définition du document PDF
      const documentDefinition = {
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
                  { text: `Tel: ${entreprise.telephone}`, style: 'companyInfo' },
                ],
              },
              {
                width: 'auto',
                stack: [
                  { text: 'FACTURE', style: 'invoiceTitle' },
                  { text: facture.numero, style: 'invoiceNumber' },
                  ...(facture.reference ? [
                    { text: 'Reference :', style: 'referenceLabel', margin: [0, 10, 0, 0] },
                    { text: facture.reference, style: 'referenceValue' }
                  ] : []),
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
                  { text: 'Facture a :', style: 'sectionHeader' },
                  { text: client.nom, style: 'clientName' },
                  { text: client.adresse, style: 'clientInfo' },
                  { text: `${client.codePostal} ${client.ville}`, style: 'clientInfo' },
                  { text: `SIRET: ${client.siret}`, style: 'clientInfo', margin: [0, 5, 0, 0] },
                ],
              },
              {
                width: 'auto',
                stack: [
                  { text: 'Date d\'emission :', style: 'dateLabel' },
                  { text: dayjs(facture.dateEmission).format('DD/MM/YYYY'), style: 'dateValue' },
                  { text: 'Date d\'echeance :', style: 'dateLabel', margin: [0, 10, 0, 0] },
                  { text: dayjs(facture.dateEcheance).format('DD/MM/YYYY'), style: 'dateValue' },
                  { text: 'Periode de prestation :', style: 'dateLabel', margin: [0, 10, 0, 0] },
                  { text: dayjs(facture.dateEmission).format('MMMM YYYY').charAt(0).toUpperCase() + dayjs(facture.dateEmission).format('MMMM YYYY').slice(1), style: 'dateValue' },
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
                  { text: 'Designation', style: 'tableHeader' },
                  { text: 'Quantite', style: 'tableHeader', alignment: 'right' },
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
                      { text: formaterMontantPDF(facture.totalHT), style: 'totalValue' },
                    ],
                    [
                      { text: `TVA (${facture.tauxTVA}%)`, style: 'totalLabel' },
                      { text: formaterMontantPDF(facture.montantTVA), style: 'totalValue' },
                    ],
                    [
                      { text: 'Total TTC', style: 'totalLabelFinal', bold: true },
                      { text: formaterMontantPDF(facture.totalTTC), style: 'totalValueFinal', bold: true },
                    ],
                  ],
                },
                layout: 'noBorders',
              },
            ],
            margin: [0, 0, 0, 40],
          },

          // Informations bancaires et mentions légales
          {
            stack: [
              {
                text: 'Informations bancaires',
                style: 'sectionHeader',
                margin: [0, 0, 0, 10]
              },
              {
                table: {
                  widths: ['auto', '*'],
                  body: [
                    [
                      { text: 'IBAN :', bold: true, style: 'bankInfo', border: [false, false, false, false] },
                      { text: entreprise.iban, style: 'bankInfo', border: [false, false, false, false] }
                    ],
                    [
                      { text: 'BIC :', bold: true, style: 'bankInfo', border: [false, false, false, false] },
                      { text: entreprise.bic, style: 'bankInfo', border: [false, false, false, false] }
                    ]
                  ]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 20]
              },
              {
                text: [
                  { text: 'Conditions de paiement : ', bold: true },
                  { text: `Paiement a ${client.delaiFacturation} jours\n` },
                  { text: `En cas de retard de paiement, une penalite de ${penalites.tauxInteretLegal} fois le taux d'interet legal sera appliquee, ainsi qu'une indemnite forfaitaire pour frais de recouvrement de ${penalites.indemniteRecouvrement} euros.\n\n` },
                  { text: 'Le reglement sera realise en Euros par virement bancaire ou par cheque. Membre d\'un centre de gestion agree, le reglement par cheque est accepte' },
                ],
                style: 'footer',
              },
            ]
          },
        ],

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
          referenceLabel: {
            fontSize: 10,
            color: '#666',
            alignment: 'right',
          },
          referenceValue: {
            fontSize: 12,
            bold: true,
            alignment: 'right',
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
          bankInfo: {
            fontSize: 11,
            color: '#333',
          },
          footer: {
            fontSize: 8,
            color: '#666',
            italics: true,
          },
        },
      };

      // Génération du PDF en buffer
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);
      pdfDocGenerator.getBuffer((buffer) => {
        resolve(buffer);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Génère le nom de fichier pour la facture
 * @param {Object} facture - La facture
 * @param {Object} client - Le client
 * @returns {string} - Le nom du fichier
 */
export const genererNomFichierFacture = (facture, client) => {
  const nomClientNettoye = client.nom.replace(/[/\\?%*:|"<>]/g, '-');
  const dateEmission = dayjs(facture.dateEmission);
  const annee = dateEmission.format('YYYY');
  const mois = dateEmission.format('MM');
  return `Facture_FAC-${annee}-${mois}-${nomClientNettoye}.pdf`;
};