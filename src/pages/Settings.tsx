import React from 'react';
import { Card, Descriptions, Alert, Space } from 'antd';
import { useData } from '../context/DataContext';

const Settings: React.FC = () => {
  const { entreprise } = useData();

  return (
    <div>
      <h1>Paramètres</h1>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="À propos de l'application">
          <Alert
            message="Application de gestion de facturation"
            description="Cette application permet de gérer vos clients, salariés et factures. Les données sont automatiquement sauvegardées dans le localStorage du navigateur."
            type="info"
            showIcon
          />
        </Card>

        <Card title="Informations de l'entreprise">
          {entreprise ? (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Nom de l'entreprise">
                {entreprise.nom}
              </Descriptions.Item>
              <Descriptions.Item label="Adresse">
                {entreprise.adresse}, {entreprise.codePostal} {entreprise.ville}
              </Descriptions.Item>
              <Descriptions.Item label="SIRET">
                {entreprise.siret}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {entreprise.email}
              </Descriptions.Item>
              <Descriptions.Item label="Téléphone">
                {entreprise.telephone}
              </Descriptions.Item>
              <Descriptions.Item label="IBAN">
                {entreprise.iban}
              </Descriptions.Item>
            </Descriptions>
          ) : (
            <Alert message="Chargement des informations..." type="info" />
          )}
        </Card>

        <Card title="Configuration">
          <Alert
            message="Modification des informations de l'entreprise"
            description={
              <div>
                <p>Pour modifier les informations de votre entreprise (nom, adresse, SIRET, IBAN, etc.), éditez le fichier :</p>
                <code style={{ 
                  display: 'block', 
                  padding: '8px', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px',
                  margin: '10px 0'
                }}>
                  src/data/entreprise.json
                </code>
                <p>Les modifications seront prises en compte au prochain rechargement de l'application.</p>
              </div>
            }
            type="warning"
            showIcon
          />
        </Card>

        <Card title="Persistance des données">
          <Alert
            message="Sauvegarde automatique"
            description={
              <div>
                <p>Toutes les données (clients, salariés, factures) sont automatiquement sauvegardées dans le <strong>localStorage</strong> de votre navigateur à chaque modification.</p>
                <ul>
                  <li><strong>Avantage</strong> : Les données persistent entre les sessions</li>
                  <li><strong>Limite</strong> : Les données sont stockées localement sur votre ordinateur uniquement</li>
                </ul>
                <p style={{ marginTop: 16 }}>
                  Pour une utilisation en production avec plusieurs utilisateurs, vous pouvez remplacer le DataContext 
                  par des appels API vers un backend (Node.js, PHP, etc.).
                </p>
              </div>
            }
            type="info"
            showIcon
          />
        </Card>

        <Card title="Taux de TVA">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Taux appliqué">
              20% (TVA standard en France)
            </Descriptions.Item>
            <Descriptions.Item label="Modification">
              Le taux de TVA peut être modifié dans le fichier <code>src/utils/invoiceUtils.ts</code>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
};

export default Settings;