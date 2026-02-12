<?php
/**
 * Endpoints: /api/factures
 * CRUD pour les factures
 */

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/factures - Liste des factures
if ($method === 'GET' && !$factureId) {
    $factures = readJSONFile('factures.json');
    if ($factures === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des factures'], 500);
    }
    jsonResponse($factures);
}

// POST /api/factures - Créer une facture
if ($method === 'POST' && !$factureId) {
    $factures = readJSONFile('factures.json');
    if ($factures === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des factures'], 500);
    }

    $body = getRequestBody();
    if (!$body) {
        jsonResponse(['error' => 'Données invalides'], 400);
    }

    $nouvelleFacture = $body;
    $nouvelleFacture['id'] = (string) round(microtime(true) * 1000);

    // Générer le numéro de facture si non fourni
    if (empty($nouvelleFacture['numero'])) {
        $annee = date('Y');
        $numero = str_pad(count($factures) + 1, INVOICE_NUMBER_PADDING, '0', STR_PAD_LEFT);
        $nouvelleFacture['numero'] = INVOICE_PREFIX . '-' . $annee . '-' . $numero;
    }

    $factures[] = $nouvelleFacture;

    if (!writeJSONFile('factures.json', $factures)) {
        jsonResponse(['error' => "Erreur lors de l'enregistrement de la facture"], 500);
    }

    jsonResponse($nouvelleFacture, 201);
}

// PUT /api/factures/:id - Modifier une facture
if ($method === 'PUT' && $factureId) {
    $factures = readJSONFile('factures.json');
    if ($factures === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des factures'], 500);
    }

    $index = null;
    foreach ($factures as $i => $f) {
        if ($f['id'] === $factureId) {
            $index = $i;
            break;
        }
    }

    if ($index === null) {
        jsonResponse(['error' => 'Facture non trouvée'], 404);
    }

    $body = getRequestBody();
    if (!$body) {
        jsonResponse(['error' => 'Données invalides'], 400);
    }

    $factures[$index] = array_merge($factures[$index], $body);

    if (!writeJSONFile('factures.json', $factures)) {
        jsonResponse(['error' => 'Erreur lors de la modification de la facture'], 500);
    }

    jsonResponse($factures[$index]);
}

// DELETE /api/factures/:id - Supprimer une facture
if ($method === 'DELETE' && $factureId) {
    $factures = readJSONFile('factures.json');
    if ($factures === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des factures'], 500);
    }

    $factures = array_values(array_filter($factures, fn($f) => $f['id'] !== $factureId));

    if (!writeJSONFile('factures.json', $factures)) {
        jsonResponse(['error' => 'Erreur lors de la suppression de la facture'], 500);
    }

    jsonResponse(['message' => 'Facture supprimée avec succès']);
}

jsonResponse(['error' => 'Méthode non autorisée'], 405);
