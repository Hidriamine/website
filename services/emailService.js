import nodemailer from 'nodemailer';
import { creerTransporteur, capitaliserMois } from './mailTransport.js';
import { server } from '../config/index.js';

/**
 * Genere le template d'email pour l'envoi de facture
 * @param {string} nomMois - Le nom du mois de la facture
 * @returns {string} - Le contenu HTML de l'email
 */
const genererTemplateEmail = (nomMois) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Cher Client,</p>

    <p>Veuillez trouver en piece jointe la facture du mois ${nomMois}.</p>

    <p>En vous remerciant pour votre reglement.</p>

    <p style="margin-top: 30px;">
      Cordialement,<br>
      <strong>NEXGENSYS</strong>
    </p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Envoie un email avec la facture en piece jointe
 * @param {Object} options - Les options d'envoi
 * @param {string|string[]} options.destinataire - L'email du destinataire
 * @param {string} options.sujet - Le sujet de l'email
 * @param {string} options.dateEmission - La date d'emission de la facture
 * @param {Buffer} options.pdfBuffer - Le buffer du PDF
 * @param {string} options.nomFichier - Le nom du fichier PDF
 * @param {Object} options.entreprise - Les informations de l'entreprise
 * @param {string} [options.emailCopie] - Email(s) a mettre en copie (CC)
 * @returns {Promise<Object>} - Le resultat de l'envoi
 */
export const envoyerEmailFacture = async ({
  destinataire,
  sujet,
  dateEmission,
  pdfBuffer,
  nomFichier,
  entreprise,
  emailCopie
}) => {
  try {
    const transporteur = creerTransporteur();
    const nomMois = capitaliserMois(dateEmission);
    const htmlContent = genererTemplateEmail(nomMois);

    const mailOptions = {
      from: `"${entreprise.nom}" <${entreprise.email}>`,
      to: destinataire,
      subject: sujet,
      html: htmlContent,
      attachments: [
        {
          filename: nomFichier,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    if (emailCopie) {
      mailOptions.cc = emailCopie;
    }

    const info = await transporteur.sendMail(mailOptions);

    console.log('Email envoye avec succes:', {
      messageId: info.messageId,
      destinataire,
      sujet,
    });

    if (!server.isProduction) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Previsualiser l\'email:', previewUrl);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

/**
 * Cree un compte de test Ethereal pour le developpement
 * @returns {Promise<Object>} - Les informations du compte de test
 */
export const creerCompteTestEmail = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('Compte de test Ethereal cree:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
    return testAccount;
  } catch (error) {
    console.error('Erreur lors de la creation du compte de test:', error);
    throw error;
  }
};
