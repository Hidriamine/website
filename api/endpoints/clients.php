<?php
/**
 * Endpoints: /api/clients
 * CRUD pour les clients
 */

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/clients - Liste des clients
if ($method === 'GET' && !$clientId) {
    $clients = readJSONFile('clients.json');
    if ($clients === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des clients'], 500);
    }
    jsonResponse($clients);
}

// POST /api/clients - Créer un client
if ($method === 'POST' && !$clientId) {
    $clients = readJSONFile('clients.json');
    if ($clients === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des clients'], 500);
    }

    $body = getRequestBody();
    if (!$body) {
        jsonResponse(['error' => 'Données invalides'], 400);
    }

    $nouveauClient = $body;
    $nouveauClient['id'] = (string) round(microtime(true) * 1000);

    $clients[] = $nouveauClient;

    if (!writeJSONFile('clients.json', $clients)) {
        jsonResponse(['error' => "Erreur lors de l'enregistrement du client"], 500);
    }

    jsonResponse($nouveauClient, 201);
}

// PUT /api/clients/:id - Modifier un client
if ($method === 'PUT' && $clientId) {
    $clients = readJSONFile('clients.json');
    if ($clients === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des clients'], 500);
    }

    $index = null;
    foreach ($clients as $i => $c) {
        if ($c['id'] === $clientId) {
            $index = $i;
            break;
        }
    }

    if ($index === null) {
        jsonResponse(['error' => 'Client non trouvé'], 404);
    }

    $body = getRequestBody();
    if (!$body) {
        jsonResponse(['error' => 'Données invalides'], 400);
    }

    $clients[$index] = array_merge($clients[$index], $body);

    if (!writeJSONFile('clients.json', $clients)) {
        jsonResponse(['error' => 'Erreur lors de la modification du client'], 500);
    }

    jsonResponse($clients[$index]);
}

// DELETE /api/clients/:id - Supprimer un client
if ($method === 'DELETE' && $clientId) {
    $clients = readJSONFile('clients.json');
    if ($clients === null) {
        jsonResponse(['error' => 'Erreur lors de la lecture des clients'], 500);
    }

    $clients = array_values(array_filter($clients, fn($c) => $c['id'] !== $clientId));

    if (!writeJSONFile('clients.json', $clients)) {
        jsonResponse(['error' => 'Erreur lors de la suppression du client'], 500);
    }

    jsonResponse(['message' => 'Client supprimé avec succès']);
}

jsonResponse(['error' => 'Méthode non autorisée'], 405);
