<?php
/**
 * Endpoints: /api/salaries
 * CRUD pour les salariés
 */

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/salaries - Liste des salariés
if ($method === 'GET' && !$salarieId) {
    $salaries = readJSONFile('salaries.json');
    if ($salaries === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des salariés'], 500);
    }
    jsonResponse($salaries);
}

// POST /api/salaries - Créer un salarié
if ($method === 'POST' && !$salarieId) {
    $salaries = readJSONFile('salaries.json');
    if ($salaries === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des salariés'], 500);
    }

    $body = getRequestBody();
    if (!$body) {
        jsonResponse(['error' => 'Données invalides'], 400);
    }

    $nouveauSalarie = $body;
    $nouveauSalarie['id'] = (string) round(microtime(true) * 1000);

    $salaries[] = $nouveauSalarie;

    if (!writeJSONFile('salaries.json', $salaries)) {
        jsonResponse(['error' => "Erreur lors de l'enregistrement du salarié"], 500);
    }

    jsonResponse($nouveauSalarie, 201);
}

// PUT /api/salaries/:id - Modifier un salarié
if ($method === 'PUT' && $salarieId) {
    $salaries = readJSONFile('salaries.json');
    if ($salaries === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des salariés'], 500);
    }

    $index = null;
    foreach ($salaries as $i => $s) {
        if ($s['id'] === $salarieId) {
            $index = $i;
            break;
        }
    }

    if ($index === null) {
        jsonResponse(['error' => 'Salarié non trouvé'], 404);
    }

    $body = getRequestBody();
    if (!$body) {
        jsonResponse(['error' => 'Données invalides'], 400);
    }

    $salaries[$index] = array_merge($salaries[$index], $body);

    if (!writeJSONFile('salaries.json', $salaries)) {
        jsonResponse(['error' => 'Erreur lors de la modification du salarié'], 500);
    }

    jsonResponse($salaries[$index]);
}

// DELETE /api/salaries/:id - Supprimer un salarié
if ($method === 'DELETE' && $salarieId) {
    $salaries = readJSONFile('salaries.json');
    if ($salaries === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des salariés'], 500);
    }

    $salaries = array_values(array_filter($salaries, fn($s) => $s['id'] !== $salarieId));

    if (!writeJSONFile('salaries.json', $salaries)) {
        jsonResponse(['error' => 'Erreur lors de la suppression du salarié'], 500);
    }

    jsonResponse(['message' => 'Salarié supprimé avec succès']);
}

jsonResponse(['error' => 'Méthode non autorisée'], 405);
