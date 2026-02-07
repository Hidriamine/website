import crypto from 'crypto';
import dayjs from 'dayjs';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin du fichier des tokens
const TOKENS_FILE = path.join(__dirname, '..', 'src', 'data', 'craTokens.json');

/**
 * Lit le fichier des tokens
 * @returns {Promise<Array>} - La liste des tokens
 */
async function lireTokens() {
  try {
    const data = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture fichier tokens:', error);
    return [];
  }
}

/**
 * Écrit dans le fichier des tokens
 * @param {Array} tokens - La liste des tokens
 * @returns {Promise<boolean>} - Succès de l'opération
 */
async function ecrireTokens(tokens) {
  try {
    await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Erreur écriture fichier tokens:', error);
    return false;
  }
}

/**
 * Génère un token unique sécurisé
 * @returns {string} - Le token généré
 */
function genererTokenUnique() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Crée un nouveau token pour la saisie CRA
 * @param {Object} salarie - Les informations du salarié
 * @param {string} mois - Le mois concerné (YYYY-MM)
 * @returns {Promise<Object>} - Le token créé avec toutes ses informations
 */
export async function creerTokenCRA(salarie, mois) {
  try {
    const tokens = await lireTokens();

    // Vérifier si un token actif existe déjà pour ce salarié et ce mois
    const tokenExistant = tokens.find(
      t => t.salarieId === salarie.id &&
           t.mois === mois &&
           !t.utilise &&
           dayjs().isBefore(dayjs(t.dateExpiration))
    );

    if (tokenExistant) {
      console.log(`ℹ️  Token existant trouvé pour ${salarie.prenom} ${salarie.nom}`);
      return tokenExistant;
    }

    // Créer un nouveau token
    const token = genererTokenUnique();
    const dateCreation = dayjs().toISOString();
    const dateExpiration = dayjs().add(10, 'day').toISOString();

    const nouveauToken = {
      token,
      salarieId: salarie.id,
      salarieNom: `${salarie.prenom} ${salarie.nom}`,
      salarieEmail: salarie.email,
      clientId: salarie.clientId,
      tauxJournalier: salarie.tauxJournalier,
      poste: salarie.poste,
      reference: salarie.reference || '',
      mois,
      dateCreation,
      dateExpiration,
      utilise: false,
      dateUtilisation: null,
      joursTravailles: null,
    };

    tokens.push(nouveauToken);
    await ecrireTokens(tokens);

    console.log(`✅ Token CRA créé pour ${salarie.prenom} ${salarie.nom} - Mois: ${mois}`);
    return nouveauToken;
  } catch (error) {
    console.error('Erreur lors de la création du token:', error);
    throw error;
  }
}

/**
 * Valide un token et récupère ses informations
 * @param {string} token - Le token à valider
 * @returns {Promise<Object|null>} - Les informations du token ou null si invalide
 */
export async function validerToken(token) {
  try {
    const tokens = await lireTokens();
    const tokenData = tokens.find(t => t.token === token);

    if (!tokenData) {
      return { valide: false, raison: 'Token introuvable' };
    }

    if (tokenData.utilise) {
      return { valide: false, raison: 'Token déjà utilisé' };
    }

    const maintenant = dayjs();
    const expiration = dayjs(tokenData.dateExpiration);

    if (maintenant.isAfter(expiration)) {
      return { valide: false, raison: 'Token expiré' };
    }

    return {
      valide: true,
      data: tokenData
    };
  } catch (error) {
    console.error('Erreur lors de la validation du token:', error);
    throw error;
  }
}

/**
 * Marque un token comme utilisé et enregistre les jours travaillés
 * @param {string} token - Le token à marquer comme utilisé
 * @param {number} joursTravailles - Le nombre de jours travaillés
 * @returns {Promise<boolean>} - Succès de l'opération
 */
export async function utiliserToken(token, joursTravailles) {
  try {
    const tokens = await lireTokens();
    const index = tokens.findIndex(t => t.token === token);

    if (index === -1) {
      return false;
    }

    tokens[index].utilise = true;
    tokens[index].dateUtilisation = dayjs().toISOString();
    tokens[index].joursTravailles = joursTravailles;

    await ecrireTokens(tokens);

    console.log(`✅ Token marqué comme utilisé - ${joursTravailles} jours travaillés`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'utilisation du token:', error);
    throw error;
  }
}

/**
 * Nettoie les tokens expirés (plus de 30 jours)
 * @returns {Promise<number>} - Nombre de tokens supprimés
 */
export async function nettoyerTokensExpires() {
  try {
    const tokens = await lireTokens();
    const limite = dayjs().subtract(30, 'day');

    const tokensActifs = tokens.filter(t => {
      const dateExpiration = dayjs(t.dateExpiration);
      return dateExpiration.isAfter(limite);
    });

    const nombreSupprimes = tokens.length - tokensActifs.length;

    if (nombreSupprimes > 0) {
      await ecrireTokens(tokensActifs);
      console.log(`🗑️  ${nombreSupprimes} token(s) expiré(s) supprimé(s)`);
    }

    return nombreSupprimes;
  } catch (error) {
    console.error('Erreur lors du nettoyage des tokens:', error);
    throw error;
  }
}
