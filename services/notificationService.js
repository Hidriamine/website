import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import { creerTokenCRA } from './craTokenService.js';

// Configuration de dayjs en français
dayjs.locale('fr');

/**
 * Crée un transporteur de mail pour les notifications
 */
const creerTransporteur = () => {
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const pass = process.env.SMTP_PASS +'#';

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER || 'test@example.com',
      pass: pass, //process.env.SMTP_PASS || 'password',
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

/**
 * Génère le template d'email pour le rappel CRA
 * @param {Object} salarie - Les informations du salarié
 * @param {string} mois - Le nom du mois
 * @param {string} annee - L'année
 * @param {string} lienSaisie - Le lien unique pour la saisie du CRA
 * @returns {string} - Le contenu HTML de l'email
 */
const genererTemplateRappelCRA = (salarie, mois, annee, lienSaisie) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .header {
      background-color: #1890ff;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
      text-align: center;
    }
    .content {
      background-color: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .important {
      background-color: #fff7e6;
      border-left: 4px solid #ffa940;
      padding: 15px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      margin: 20px 0;
      background-color: #52c41a;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      text-align: center;
    }
    .btn:hover {
      background-color: #389e0d;
    }
    .link-info {
      background-color: #e6f7ff;
      border-left: 4px solid #1890ff;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e8e8e8;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Rappel CRA</h1>
    </div>
    <div class="content">
      <p>Bonjour ${salarie.prenom},</p>

      <p>Nous vous rappelons qu'il est temps de saisir votre <strong>Compte Rendu d'Activité (CRA)</strong> pour le mois de <strong>${mois} ${annee}</strong>.</p>

      <div class="important">
        <strong>⏰ Date limite :</strong> Merci de saisir votre CRA avant la fin du mois.
      </div>

      <p><strong>Informations de votre mission :</strong></p>
      <ul>
        <li>Poste : ${salarie.poste}</li>
        ${salarie.reference ? `<li>Référence : ${salarie.reference}</li>` : ''}
      </ul>

      <div style="text-align: center;">
        <a href="${lienSaisie}" class="btn">🔗 Saisir mon CRA</a>
      </div>

      <div class="link-info">
        <strong>ℹ️ Information importante :</strong><br>
        Ce lien est <strong>à usage unique</strong> et expire automatiquement dans <strong>10 jours</strong>.<br>
        Une fois votre CRA saisi, la facture sera générée automatiquement.
      </div>

      <p>Si vous avez déjà saisi votre CRA, merci d'ignorer ce message.</p>

      <p>Pour toute question, n'hésitez pas à nous contacter.</p>

      <p style="margin-top: 30px;">
        Cordialement,<br>
        <strong>L'équipe NEXGENSYS</strong>
      </p>

      <div class="footer">
        <p>Ceci est un message automatique envoyé le 25 de chaque mois.</p>
        <p style="color: #999; font-size: 11px; margin-top: 10px;">
          Si vous ne pouvez pas cliquer sur le bouton, copiez et collez ce lien dans votre navigateur :<br>
          ${lienSaisie}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Envoie un email de rappel CRA à un salarié
 * @param {Object} salarie - Les informations du salarié
 * @param {Object} entreprise - Les informations de l'entreprise
 * @returns {Promise<Object>} - Le résultat de l'envoi
 */
export const envoyerRappelCRAEmail = async (salarie, entreprise) => {
  try {
    const transporteur = creerTransporteur();

    // Obtenir le mois et l'année courants
    const maintenant = dayjs();
    const mois = maintenant.format('MMMM');
    const moisCapitalise = mois.charAt(0).toUpperCase() + mois.slice(1);
    const annee = maintenant.format('YYYY');
    const moisFormat = maintenant.format('YYYY-MM'); // Format pour le token

    // Créer un token unique pour ce salarié et ce mois
    const tokenData = await creerTokenCRA(salarie, moisFormat);

    // Construire le lien de saisie CRA
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const lienSaisie = `${baseUrl}/saisie-cra/${tokenData.token}`;

    // Générer le contenu de l'email avec le lien
    const htmlContent = genererTemplateRappelCRA(salarie, moisCapitalise, annee, lienSaisie);

    // Options de l'email
    const mailOptions = {
      from: `"${entreprise.nom}" <${entreprise.email}>`,
      to: salarie.email,
      subject: `Rappel CRA - ${moisCapitalise} ${annee}`,
      html: htmlContent,
    };

    // Envoi de l'email
    const info = await transporteur.sendMail(mailOptions);

    console.log(`✅ Email de rappel CRA envoyé à ${salarie.prenom} ${salarie.nom} (${salarie.email})`);
    console.log(`   🔗 Lien de saisie : ${lienSaisie}`);

    return {
      success: true,
      messageId: info.messageId,
      destinataire: salarie.email,
      token: tokenData.token,
      lienSaisie: lienSaisie,
    };
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi de l'email à ${salarie.prenom} ${salarie.nom}:`, error.message);
    return {
      success: false,
      error: error.message,
      destinataire: salarie.email,
    };
  }
};

/**
 * Envoie un SMS de rappel CRA à un salarié
 * Note: Nécessite la configuration d'un service SMS (Twilio, etc.)
 * @param {Object} salarie - Les informations du salarié
 * @returns {Promise<Object>} - Le résultat de l'envoi
 */
export const envoyerRappelCRASMS = async (salarie) => {
  try {
    // Vérifier si le salarié a un numéro de téléphone
    if (!salarie.telephone) {
      console.log(`⚠️  Pas de numéro de téléphone pour ${salarie.prenom} ${salarie.nom}`);
      return {
        success: false,
        error: 'Numéro de téléphone non configuré',
        destinataire: salarie.telephone,
      };
    }

    // Obtenir le mois et l'année courants
    const maintenant = dayjs();
    const mois = maintenant.format('MMMM');
    const moisCapitalise = mois.charAt(0).toUpperCase() + mois.slice(1);
    const annee = maintenant.format('YYYY');

    const message = `Bonjour ${salarie.prenom}, rappel : merci d'envoyer votre CRA pour ${moisCapitalise} ${annee}. Cordialement, NEXGENSYS`;

    // TODO: Implémenter l'envoi SMS avec votre service (Twilio, etc.)
    // Exemple avec Twilio (à décommenter et configurer):
    
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: salarie.telephone
    });

    console.log(`✅ SMS de rappel CRA envoyé à ${salarie.prenom} ${salarie.nom} (${salarie.telephone})`);
    return {
      success: true,
      messageId: result.sid,
      destinataire: salarie.telephone,
    };
    

    console.log(`📱 SMS à envoyer à ${salarie.prenom} ${salarie.nom} (${salarie.telephone}): ${message}`);
    console.log('ℹ️  L\'envoi de SMS n\'est pas encore configuré. Consultez CONFIGURATION_NOTIFICATIONS.md');

    return {
      success: false,
      error: 'Service SMS non configuré',
      destinataire: salarie.telephone,
      message: message,
    };
  } catch (error) {
    console.error(`❌ Erreur lors de l'envoi du SMS à ${salarie.prenom} ${salarie.nom}:`, error.message);
    return {
      success: false,
      error: error.message,
      destinataire: salarie.telephone,
    };
  }
};

/**
 * Envoie des rappels CRA à tous les salariés
 * @param {Array} salaries - La liste des salariés
 * @param {Object} entreprise - Les informations de l'entreprise
 * @param {Object} options - Options d'envoi (email, sms)
 * @returns {Promise<Object>} - Le résultat des envois
 */
export const envoyerRappelsCRA = async (salaries, entreprise, options = { email: true, sms: false }) => {
  console.log(`\n🔔 Début de l'envoi des rappels CRA pour ${salaries.length} salarié(s)...\n`);

  const resultats = {
    emailsEnvoyes: 0,
    emailsEchoues: 0,
    smsEnvoyes: 0,
    smsEchoues: 0,
    details: [],
  };

  for (const salarie of salaries) {
    const resultatSalarie = {
      salarie: `${salarie.prenom} ${salarie.nom}`,
      email: null,
      sms: null,
    };

    // Envoyer l'email si activé
    if (options.email && salarie.email) {
      const resultatEmail = await envoyerRappelCRAEmail(salarie, entreprise);
      resultatSalarie.email = resultatEmail;

      if (resultatEmail.success) {
        resultats.emailsEnvoyes++;
      } else {
        resultats.emailsEchoues++;
      }
    }

    // Envoyer le SMS si activé
    if (options.sms && salarie.telephone) {
      const resultatSMS = await envoyerRappelCRASMS(salarie);
      resultatSalarie.sms = resultatSMS;

      if (resultatSMS.success) {
        resultats.smsEnvoyes++;
      } else {
        resultats.smsEchoues++;
      }
    }

    resultats.details.push(resultatSalarie);

    // Attendre un peu entre chaque envoi pour ne pas surcharger le serveur SMTP
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✨ Rappels CRA terminés :`);
  console.log(`   📧 Emails : ${resultats.emailsEnvoyes} envoyé(s), ${resultats.emailsEchoues} échoué(s)`);
  console.log(`   📱 SMS : ${resultats.smsEnvoyes} envoyé(s), ${resultats.smsEchoues} échoué(s)\n`);

  return resultats;
};
