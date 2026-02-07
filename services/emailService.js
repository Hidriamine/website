import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';

// Configuration de dayjs en français
dayjs.locale('fr');

/**
 * Crée un transporteur de mail
 * Note: Configuration à personnaliser selon votre fournisseur d'email
 */
const creerTransporteur = () => {
  // Pour le développement/test, on utilise un compte de test Ethereal
  // En production, remplacez ceci par votre configuration SMTP réelle
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const pass = process.env.SMTP_PASS +'#';
  

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: port,
    secure: port === 465, // true pour 465 (SSL), false pour 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER || 'test@example.com',
      pass: pass, //process.env.SMTP_PASS || 'password',
    },
    tls: {
      // Ne pas échouer sur les certificats invalides (utile pour le développement)
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

/**
 * Génère le template d'email pour l'envoi de facture
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

    <p>Veuillez trouver en pièce jointe la facture du mois ${nomMois}.</p>

    <p>En vous remerciant pour votre règlement.</p>

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
 * Extrait le nom du mois à partir de la date d'émission
 * @param {string} dateEmission - La date d'émission au format YYYY-MM-DD
 * @returns {string} - Le nom du mois (ex: "Janvier", "Février", etc.)
 */
const extraireNomMois = (dateEmission) => {
  const date = dayjs(dateEmission);
  // Capitaliser la première lettre du mois
  const nomMois = date.format('MMMM');
  return nomMois.charAt(0).toUpperCase() + nomMois.slice(1);
};

/**
 * Envoie un email avec la facture en pièce jointe
 * @param {Object} options - Les options d'envoi
 * @param {string|string[]} options.destinataire - L'email du destinataire ou liste d'emails séparés par virgule
 * @param {string} options.sujet - Le sujet de l'email
 * @param {string} options.dateEmission - La date d'émission de la facture
 * @param {Buffer} options.pdfBuffer - Le buffer du PDF
 * @param {string} options.nomFichier - Le nom du fichier PDF
 * @param {Object} options.entreprise - Les informations de l'entreprise
 * @param {string} [options.emailCopie] - Email(s) à mettre en copie (CC)
 * @returns {Promise<Object>} - Le résultat de l'envoi
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

    // Extraire le nom du mois de la date d'émission
    const nomMois = extraireNomMois(dateEmission);

    // Générer le contenu de l'email
    const htmlContent = genererTemplateEmail(nomMois);

    // Options de l'email
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

    // Ajouter l'email en copie si fourni
    if (emailCopie) {
      mailOptions.cc = emailCopie;
    }

    // Envoi de l'email
    const info = await transporteur.sendMail(mailOptions);

    console.log('✅ Email envoyé avec succès:', {
      messageId: info.messageId,
      destinataire,
      sujet,
    });

    // Pour le développement avec Ethereal, afficher l'URL de prévisualisation
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Prévisualiser l\'email:', previewUrl);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw error;
  }
};

/**
 * Crée un compte de test Ethereal pour le développement
 * @returns {Promise<Object>} - Les informations du compte de test
 */
export const creerCompteTestEmail = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log('📧 Compte de test Ethereal créé:');
    console.log('   User:', testAccount.user);
    console.log('   Pass:', testAccount.pass);
    console.log('');
    console.log('Ajoutez ces variables d\'environnement pour utiliser ce compte:');
    console.log(`   SMTP_HOST=smtp.ethereal.email`);
    console.log(`   SMTP_PORT=587`);
    console.log(`   SMTP_USER=${testAccount.user}`);
    console.log(`   SMTP_PASS=${testAccount.pass}`);
    return testAccount;
  } catch (error) {
    console.error('Erreur lors de la création du compte de test:', error);
    throw error;
  }
};
