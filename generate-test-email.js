import { creerCompteTestEmail } from './services/emailService.js';

console.log('🔧 Génération des identifiants de test email...\n');

creerCompteTestEmail()
  .then(() => {
    console.log('\n✅ Compte de test créé avec succès!');
    console.log('\nCopiez les variables ci-dessus dans un fichier .env à la racine du projet.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
