<?php
/**
 * Endpoint: GET /api/cra-token/:token
 * Validation d'un token CRA et récupération des informations
 */

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

$tokens = readJSONFile('craTokens.json');
if ($tokens === null) {
    $tokens = [];
}

// Chercher le token
$tokenData = null;
foreach ($tokens as $t) {
    if ($t['token'] === $craToken) {
        $tokenData = $t;
        break;
    }
}

if (!$tokenData) {
    jsonResponse(['valide' => false, 'raison' => 'Token introuvable'], 400);
}

if (!empty($tokenData['utilise'])) {
    jsonResponse(['valide' => false, 'raison' => 'Token déjà utilisé'], 400);
}

// Vérifier l'expiration
$maintenant = new DateTime();
$expiration = new DateTime($tokenData['dateExpiration']);

if ($maintenant > $expiration) {
    jsonResponse(['valide' => false, 'raison' => 'Token expiré'], 400);
}

// Token valide
jsonResponse([
    'valide' => true,
    'salarie' => [
        'nom' => $tokenData['salarieNom'],
        'email' => $tokenData['salarieEmail'],
        'poste' => $tokenData['poste'],
        'reference' => $tokenData['reference'],
    ],
    'mois' => $tokenData['mois'],
    'tauxJournalier' => $tokenData['tauxJournalier'],
]);
