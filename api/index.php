<?php
/**
 * Routeur API principal - NEXGENSYS Facturation
 * Remplace le serveur Express.js pour l'hébergement mutualisé IONOS
 */

// Headers CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/helpers.php';

// Déterminer le chemin de la requête
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';

// Retirer le basePath et les query strings
$path = parse_url($requestUri, PHP_URL_PATH);
if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}
$path = rtrim($path, '/');
if (empty($path)) {
    $path = '/';
}

$method = $_SERVER['REQUEST_METHOD'];

// ============ ROUTAGE ============

// POST /login
if ($path === '/login' && $method === 'POST') {
    require __DIR__ . '/endpoints/login.php';
    exit;
}

// GET /entreprise
if ($path === '/entreprise' && $method === 'GET') {
    require __DIR__ . '/endpoints/entreprise.php';
    exit;
}

// /clients
if (preg_match('#^/clients(/([^/]+))?$#', $path, $matches)) {
    $clientId = $matches[2] ?? null;
    require __DIR__ . '/endpoints/clients.php';
    exit;
}

// /salaries
if (preg_match('#^/salaries(/([^/]+))?$#', $path, $matches)) {
    $salarieId = $matches[2] ?? null;
    require __DIR__ . '/endpoints/salaries.php';
    exit;
}

// /factures/:id/send-email (doit être avant /factures/:id)
if (preg_match('#^/factures/([^/]+)/send-email$#', $path, $matches)) {
    $factureId = $matches[1];
    require __DIR__ . '/endpoints/send-email.php';
    exit;
}

// /factures
if (preg_match('#^/factures(/([^/]+))?$#', $path, $matches)) {
    $factureId = $matches[2] ?? null;
    require __DIR__ . '/endpoints/factures.php';
    exit;
}

// GET /cra-token/:token
if (preg_match('#^/cra-token/([^/]+)$#', $path, $matches) && $method === 'GET') {
    $craToken = $matches[1];
    require __DIR__ . '/endpoints/cra-token.php';
    exit;
}

// POST /cra-saisie
if ($path === '/cra-saisie' && $method === 'POST') {
    require __DIR__ . '/endpoints/cra-saisie.php';
    exit;
}

// POST /rappels-cra/envoyer
if ($path === '/rappels-cra/envoyer' && $method === 'POST') {
    jsonResponse(['error' => 'Les rappels CRA ne sont pas disponibles en hébergement mutualisé. Utilisez les tâches CRON IONOS.'], 501);
}

// Route non trouvée
jsonResponse(['error' => 'Endpoint non trouvé', 'path' => $path, 'method' => $method], 404);
