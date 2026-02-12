<?php
/**
 * Endpoint: POST /api/factures/:id/send-email
 * Envoi de facture par email via SMTP
 * Utilise la fonction mail() de PHP avec les headers SMTP configurés
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

// Charger les données nécessaires
$factures = readJSONFile('factures.json');
$clients = readJSONFile('clients.json');
$entreprise = readJSONFile('entreprise.json');

if (!$factures || !$clients || !$entreprise) {
    jsonResponse(['error' => 'Erreur lors de la lecture des données'], 500);
}

// Trouver la facture
$facture = null;
foreach ($factures as $f) {
    if ($f['id'] === $factureId) {
        $facture = $f;
        break;
    }
}

if (!$facture) {
    jsonResponse(['error' => 'Facture non trouvée'], 404);
}

// Trouver le client
$client = null;
foreach ($clients as $c) {
    if ($c['id'] === $facture['clientId']) {
        $client = $c;
        break;
    }
}

if (!$client) {
    jsonResponse(['error' => 'Client non trouvé'], 404);
}

if (empty($client['email'])) {
    jsonResponse(['error' => "Le client n'a pas d'adresse email"], 400);
}

// Extraire le mois de la date d'émission
$dateEmission = new DateTime($facture['dateEmission']);
$mois = getMoisFrancais((int)$dateEmission->format('n'));
$annee = $dateEmission->format('Y');

$sujet = "Facture $mois $annee - {$entreprise['nom']}";

// Construire le contenu HTML de l'email
$htmlContent = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <p>Cher Client,</p>
    <p>Veuillez trouver ci-joint la facture du mois {$mois}.</p>
    <p>En vous remerciant pour votre règlement.</p>
    <p style="margin-top: 30px;">
      Cordialement,<br>
      <strong>{$entreprise['nom']}</strong>
    </p>
  </div>
</body>
</html>
HTML;

// Envoyer l'email via SMTP avec PHPMailer si disponible, sinon mail()
try {
    // Vérifier si PHPMailer est disponible (via composer autoload)
    $phpmailerPath = __DIR__ . '/../vendor/autoload.php';

    if (file_exists($phpmailerPath)) {
        require_once $phpmailerPath;

        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';

        $mail->setFrom($entreprise['email'], $entreprise['nom']);
        $mail->addAddress($client['email']);

        // Copie à l'entreprise
        if (!empty($entreprise['email'])) {
            $mail->addCC($entreprise['email']);
        }

        $mail->isHTML(true);
        $mail->Subject = $sujet;
        $mail->Body = $htmlContent;

        $mail->send();

        jsonResponse([
            'success' => true,
            'message' => 'Email envoyé avec succès',
            'destinataire' => $client['email'],
        ]);
    } else {
        // Fallback: utiliser la fonction mail() native PHP
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            "From: {$entreprise['nom']} <{$entreprise['email']}>",
            "Reply-To: {$entreprise['email']}",
            "Cc: {$entreprise['email']}",
        ];

        $sent = mail($client['email'], $sujet, $htmlContent, implode("\r\n", $headers));

        if ($sent) {
            jsonResponse([
                'success' => true,
                'message' => 'Email envoyé avec succès (via mail())',
                'destinataire' => $client['email'],
            ]);
        } else {
            jsonResponse([
                'error' => "Erreur lors de l'envoi de l'email",
                'details' => 'La fonction mail() a échoué. Installez PHPMailer pour un envoi SMTP fiable.',
            ], 500);
        }
    }
} catch (Exception $e) {
    jsonResponse([
        'error' => "Erreur lors de l'envoi de l'email",
        'details' => $e->getMessage(),
    ], 500);
}
