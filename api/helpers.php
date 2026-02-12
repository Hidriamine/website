<?php
/**
 * Fonctions utilitaires pour la lecture/écriture de fichiers JSON
 */

require_once __DIR__ . '/config.php';

/**
 * Lit un fichier JSON et retourne les données décodées
 */
function readJSONFile(string $filename): ?array {
    $filePath = DATA_DIR . '/' . $filename;

    if (!file_exists($filePath)) {
        error_log("Fichier introuvable: $filePath");
        return null;
    }

    $content = file_get_contents($filePath);
    if ($content === false) {
        error_log("Erreur lecture fichier: $filePath");
        return null;
    }

    $data = json_decode($content, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Erreur JSON dans $filePath: " . json_last_error_msg());
        return null;
    }

    return $data;
}

/**
 * Écrit des données dans un fichier JSON
 */
function writeJSONFile(string $filename, array $data): bool {
    $filePath = DATA_DIR . '/' . $filename;

    // Créer le dossier parent si nécessaire
    $dir = dirname($filePath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $result = file_put_contents($filePath, $json, LOCK_EX);

    if ($result === false) {
        error_log("Erreur écriture fichier: $filePath");
        return false;
    }

    return true;
}

/**
 * Envoie une réponse JSON avec le code HTTP approprié
 */
function jsonResponse(array $data, int $statusCode = 200): void {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Lit le corps de la requête JSON
 */
function getRequestBody(): ?array {
    $body = file_get_contents('php://input');
    if (empty($body)) {
        return null;
    }

    $data = json_decode($body, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }

    return $data;
}

/**
 * Noms de mois en français
 */
function getMoisFrancais(int $mois): string {
    $noms = [
        1 => 'Janvier', 2 => 'Février', 3 => 'Mars',
        4 => 'Avril', 5 => 'Mai', 6 => 'Juin',
        7 => 'Juillet', 8 => 'Août', 9 => 'Septembre',
        10 => 'Octobre', 11 => 'Novembre', 12 => 'Décembre'
    ];
    return $noms[$mois] ?? '';
}
