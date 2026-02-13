import nodemailer from 'nodemailer';
import dayjs from 'dayjs';
import 'dayjs/locale/fr.js';
import { smtp, server } from '../config/index.js';

dayjs.locale('fr');

/**
 * Cree un transporteur de mail nodemailer
 * Configuration partagee entre emailService et notificationService
 * @returns {import('nodemailer').Transporter}
 */
export const creerTransporteur = () => {
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === smtp.sslPort,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
    tls: {
      rejectUnauthorized: server.isProduction,
    },
  });
};

/**
 * Capitalise la premiere lettre d'un nom de mois
 * @param {string} dateStr - Date au format YYYY-MM-DD ou objet dayjs
 * @returns {string} - Nom du mois avec majuscule (ex: "Janvier")
 */
export const capitaliserMois = (dateStr) => {
  const mois = dayjs(dateStr).format('MMMM');
  return mois.charAt(0).toUpperCase() + mois.slice(1);
};
