import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des fichiers JSON
const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const SALARIES_FILE = path.join(DATA_DIR, 'salaries.json');
const FACTURES_FILE = path.join(DATA_DIR, 'factures.json');
const ENTREPRISE_FILE = path.join(DATA_DIR, 'entreprise.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * Lit un fichier JSON et retourne les donnees parsees
 * @param {string} filePath - Le chemin du fichier
 * @returns {Promise<any|null>} - Les donnees ou null en cas d'erreur
 */
export async function readJSONFile(filePath) {
  try {
    await fs.access(filePath);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur lecture fichier ${filePath}:`, error.message);
    console.error(`  Chemin absolu: ${path.resolve(filePath)}`);
    return null;
  }
}

/**
 * Ecrit des donnees dans un fichier JSON
 * @param {string} filePath - Le chemin du fichier
 * @param {any} data - Les donnees a ecrire
 * @returns {Promise<boolean>} - Succes de l'operation
 */
export async function writeJSONFile(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Erreur ecriture fichier ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Verifie que le dossier data existe
 */
export async function verifierDossierData() {
  try {
    await fs.access(DATA_DIR);
    console.log(`Dossier data trouve: ${DATA_DIR}`);
  } catch {
    console.error(`Dossier data introuvable: ${DATA_DIR}`);
    console.error(`   Verifiez que le dossier src/data/ existe et contient les fichiers JSON`);
  }
}

export {
  DATA_DIR,
  CLIENTS_FILE,
  SALARIES_FILE,
  FACTURES_FILE,
  ENTREPRISE_FILE,
  USERS_FILE,
};
