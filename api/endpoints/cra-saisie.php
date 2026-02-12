<?php
/**
 * Endpoint: POST /api/cra-saisie
 * Soumission de la saisie CRA et génération automatique de facture
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

$body = getRequestBody();
if (!$body || empty($body['token']) || empty($body['joursTravailles'])) {
    jsonResponse(['success' => false, 'error' => 'Token et jours travaillés requis'], 400);
}

$token = $body['token'];
$joursTravailles = (int) $body['joursTravailles'];

// Valider le token
$tokens = readJSONFile('craTokens.json');
if ($tokens === null) {
    $tokens = [];
}

$tokenIndex = null;
$tokenData = null;
foreach ($tokens as $i => $t) {
    if ($t['token'] === $token) {
        $tokenIndex = $i;
        $tokenData = $t;
        break;
    }
}

if (!$tokenData) {
    jsonResponse(['success' => false, 'error' => 'Token introuvable'], 400);
}

if (!empty($tokenData['utilise'])) {
    jsonResponse(['success' => false, 'error' => 'Token déjà utilisé'], 400);
}

$maintenant = new DateTime();
$expiration = new DateTime($tokenData['dateExpiration']);

if ($maintenant > $expiration) {
    jsonResponse(['success' => false, 'error' => 'Token expiré'], 400);
}

// Valider le nombre de jours
if ($joursTravailles <= 0 || $joursTravailles > MAX_JOURS_TRAVAILLES) {
    jsonResponse([
        'success' => false,
        'error' => "Le nombre de jours travaillés doit être entre 1 et " . MAX_JOURS_TRAVAILLES,
    ], 400);
}

// Marquer le token comme utilisé
$tokens[$tokenIndex]['utilise'] = true;
$tokens[$tokenIndex]['dateUtilisation'] = $maintenant->format('c');
$tokens[$tokenIndex]['joursTravailles'] = $joursTravailles;
writeJSONFile('craTokens.json', $tokens);

// Charger les données nécessaires
$factures = readJSONFile('factures.json');
$clients = readJSONFile('clients.json');
$entreprise = readJSONFile('entreprise.json');

if (!$factures || !$clients || !$entreprise) {
    jsonResponse(['success' => false, 'error' => 'Erreur lors de la lecture des données'], 500);
}

// Trouver le client
$client = null;
foreach ($clients as $c) {
    if ($c['id'] === $tokenData['clientId']) {
        $client = $c;
        break;
    }
}

if (!$client) {
    jsonResponse(['success' => false, 'error' => 'Client non trouvé'], 404);
}

// Préparer les dates
$dateMois = DateTime::createFromFormat('Y-m', $tokenData['mois']);
$dateEmission = new DateTime($dateMois->format('Y-m-t')); // Dernier jour du mois
$dateEcheance = new DateTime($dateMois->format('Y-m-t'));
$dateEcheance->modify('+1 month');
$dateEcheance = new DateTime($dateEcheance->format('Y-m-t'));

// Calculer les montants
$montantHT = $joursTravailles * $tokenData['tauxJournalier'];
$tauxTVA = TAUX_TVA;
$montantTVA = $montantHT * ($tauxTVA / 100);
$totalTTC = $montantHT + $montantTVA;

// Générer le numéro de facture
$annee = $dateMois->format('Y');
$numero = str_pad(count($factures) + 1, INVOICE_NUMBER_PADDING, '0', STR_PAD_LEFT);
$numeroFacture = INVOICE_PREFIX . '-' . $annee . '-' . $numero;

// Créer la facture
$timestamp = (string) round(microtime(true) * 1000);
$nouvelleFacture = [
    'id' => $timestamp,
    'numero' => $numeroFacture,
    'clientId' => $tokenData['clientId'],
    'dateEmission' => $dateEmission->format('Y-m-d'),
    'dateEcheance' => $dateEcheance->format('Y-m-d'),
    'lignes' => [
        [
            'id' => (string) ((int)$timestamp + 1),
            'designation' => $tokenData['poste'],
            'quantite' => $joursTravailles,
            'prixUnitaire' => $tokenData['tauxJournalier'],
            'montantHT' => $montantHT,
        ],
    ],
    'totalHT' => $montantHT,
    'tauxTVA' => $tauxTVA,
    'montantTVA' => $montantTVA,
    'totalTTC' => $totalTTC,
    'statut' => 'brouillon',
    'reference' => $tokenData['reference'],
];

$factures[] = $nouvelleFacture;
writeJSONFile('factures.json', $factures);

jsonResponse([
    'success' => true,
    'message' => 'CRA enregistré et facture générée avec succès',
    'facture' => $nouvelleFacture,
]);
