<?php
/**
 * Configuration PHP pour l'API NEXGENSYS
 * Equivalent de config/index.js pour l'hébergement IONOS Web Hosting
 */

// Chemin vers le dossier data (relatif à la racine du webspace)
define('DATA_DIR', __DIR__ . '/../data');

// ============ SMTP / EMAIL ============
define('SMTP_HOST', 'smtp.ionos.fr');
define('SMTP_PORT', 465);
define('SMTP_USER', 'contact@nexgensys.fr');
define('SMTP_PASS', ''); // A configurer via config.local.php
define('SMTP_SECURE', true); // true pour SSL (port 465), false pour TLS (port 587)

// ============ FACTURATION ============
define('TAUX_TVA', 20);
define('INVOICE_PREFIX', 'FAC');
define('INVOICE_NUMBER_PADDING', 3);
define('DEFAULT_DELAI_FACTURATION', 30);
define('MAX_JOURS_TRAVAILLES', 31);

// ============ PENALITES ============
define('PENALITE_TAUX_INTERET_LEGAL', 3);
define('INDEMNITE_RECOUVREMENT', 40);

// ============ TOKENS CRA ============
define('CRA_TOKEN_EXPIRATION_DAYS', 10);
define('CRA_TOKEN_CLEANUP_DAYS', 30);

// ============ URLS ============
define('BASE_URL', 'http://s1083854234.onlinehome.fr');

// Charger la configuration locale si elle existe (contient les mots de passe)
$localConfig = __DIR__ . '/config.local.php';
if (file_exists($localConfig)) {
    require_once $localConfig;
}
