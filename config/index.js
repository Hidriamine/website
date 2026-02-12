import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// ============ SERVEUR ============
export const server = {
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// ============ SMTP / EMAIL ============
export const smtp = {
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  user: process.env.SMTP_USER || 'test@example.com',
  pass: process.env.SMTP_PASS || '',
  sslPort: 465,
};

// ============ URLS ============
export const urls = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.VITE_API_URL || '/api',
};

// ============ FACTURATION ============
export const facturation = {
  tauxTVA: parseInt(process.env.TAUX_TVA || '20', 10),
  invoicePrefix: process.env.INVOICE_PREFIX || 'FAC',
  invoiceNumberPadding: parseInt(process.env.INVOICE_NUMBER_PADDING || '3', 10),
  defaultDelaiFacturation: parseInt(process.env.DEFAULT_DELAI_FACTURATION || '30', 10),
  maxJoursTravailles: parseInt(process.env.MAX_JOURS_TRAVAILLES || '31', 10),
};

// ============ PÉNALITÉS ============
export const penalites = {
  tauxInteretLegal: parseInt(process.env.PENALITE_TAUX_INTERET_LEGAL || '3', 10),
  indemniteRecouvrement: parseInt(process.env.INDEMNITE_RECOUVREMENT || '40', 10),
};

// ============ TOKENS CRA ============
export const craToken = {
  expirationDays: parseInt(process.env.CRA_TOKEN_EXPIRATION_DAYS || '10', 10),
  cleanupDays: parseInt(process.env.CRA_TOKEN_CLEANUP_DAYS || '30', 10),
};

// ============ CRON / PLANIFICATION ============
export const cron = {
  schedule: process.env.CRA_CRON_SCHEDULE || '0 9 25 * *',
  timezone: process.env.CRA_CRON_TIMEZONE || 'Europe/Paris',
  emailSendDelayMs: parseInt(process.env.EMAIL_SEND_DELAY_MS || '1000', 10),
};

// Export par défaut de toute la configuration
const config = {
  server,
  smtp,
  urls,
  facturation,
  penalites,
  craToken,
  cron,
};

export default config;