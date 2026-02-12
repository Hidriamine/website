<?php
/**
 * Endpoint: GET /api/entreprise
 * Lecture des informations de l'entreprise
 */

$entreprise = readJSONFile('entreprise.json');
if ($entreprise === null) {
    jsonResponse(['error' => "Erreur lors de la lecture de l'entreprise"], 500);
}

jsonResponse($entreprise);
