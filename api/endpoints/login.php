<?php
/**
 * Endpoint: POST /api/login
 * Authentification utilisateur
 */

$body = getRequestBody();

if (!$body || empty($body['email']) || empty($body['password'])) {
    jsonResponse(['error' => 'Email et mot de passe requis'], 400);
}

$users = readJSONFile('users.json');
if ($users === null) {
    jsonResponse(['error' => 'Erreur lors de la lecture des utilisateurs'], 500);
}

$user = null;
foreach ($users as $u) {
    if ($u['email'] === $body['email'] && $u['password'] === $body['password']) {
        $user = $u;
        break;
    }
}

if (!$user) {
    jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
}

jsonResponse([
    'success' => true,
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'nom' => $user['nom'],
    ],
]);
