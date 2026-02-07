import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Alert,
  Spin,
  Result,
  Typography,
  Space,
  Descriptions,
  Divider,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  CalendarOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { API_BASE_URL } from '../config';

dayjs.locale('fr');

const { Title, Text } = Typography;

interface TokenData {
  valide: boolean;
  raison?: string;
  salarie?: {
    nom: string;
    email: string;
    poste: string;
    reference: string;
  };
  mois?: string;
  tauxJournalier?: number;
}

const SaisieCRAPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cra-token/${token}`);
      const data = await response.json();

      if (response.ok && data.valide) {
        setTokenData(data);
      } else {
        setTokenData({ valide: false, raison: data.raison || 'Token invalide' });
      }
    } catch (err) {
      console.error('Erreur lors de la validation du token:', err);
      setTokenData({
        valide: false,
        raison: 'Erreur de connexion au serveur',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { joursTravailles: number }) => {
    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cra-saisie`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          joursTravailles: values.joursTravailles,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        form.resetFields();
      } else {
        setError(data.error || 'Erreur lors de la soumission');
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setSubmitting(false);
    }
  };

  const formatMois = (mois: string) => {
    const date = dayjs(mois, 'YYYY-MM');
    return date.format('MMMM YYYY').charAt(0).toUpperCase() + date.format('MMMM YYYY').slice(1);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <Card style={{ maxWidth: 400, textAlign: 'center' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <Title level={4} style={{ marginTop: 24 }}>
            Validation du lien...
          </Title>
          <Text type="secondary">Veuillez patienter</Text>
        </Card>
      </div>
    );
  }

  if (!tokenData?.valide) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
      }}>
        <Card style={{ maxWidth: 600 }}>
          <Result
            status="error"
            icon={<CloseCircleOutlined />}
            title="Lien invalide ou expiré"
            subTitle={tokenData?.raison || 'Ce lien n\'est plus valide'}
            extra={
              <Space direction="vertical" size="middle">
                <Text type="secondary">
                  Raisons possibles :
                </Text>
                <ul style={{ textAlign: 'left', color: '#666' }}>
                  <li>Le lien a déjà été utilisé</li>
                  <li>Le lien a expiré (validité de 10 jours)</li>
                  <li>Le lien est incorrect</li>
                </ul>
                <Alert
                  message="Besoin d'aide ?"
                  description="Veuillez contacter votre gestionnaire pour recevoir un nouveau lien."
                  type="info"
                  showIcon
                />
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
      }}>
        <Card style={{ maxWidth: 600 }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined />}
            title="CRA enregistré avec succès !"
            subTitle="Votre compte rendu d'activité a été enregistré et la facture sera générée automatiquement."
            extra={
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Alert
                  message="Confirmation"
                  description={
                    <div>
                      <p>Vos jours travaillés ont été enregistrés pour le mois de <strong>{formatMois(tokenData.mois!)}</strong>.</p>
                      <p>Une facture sera générée et envoyée au client.</p>
                    </div>
                  }
                  type="success"
                  showIcon
                />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  Vous pouvez fermer cette page en toute sécurité.
                </Text>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '24px',
    }}>
      <Card
        style={{
          maxWidth: 600,
          width: '100%',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
          📋 Saisie du CRA
        </Title>
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          Compte Rendu d'Activité
        </Text>

        <Divider />

        <Descriptions column={1} bordered size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label={<><UserOutlined /> Salarié</>}>
            <strong>{tokenData.salarie?.nom}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Poste">
            {tokenData.salarie?.poste}
          </Descriptions.Item>
          {tokenData.salarie?.reference && (
            <Descriptions.Item label="Référence">
              {tokenData.salarie.reference}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={<><CalendarOutlined /> Période</>}>
            <strong>{formatMois(tokenData.mois!)}</strong>
          </Descriptions.Item>
          <Descriptions.Item label={<><DollarOutlined /> Taux journalier</>}>
            {tokenData.tauxJournalier}€
          </Descriptions.Item>
        </Descriptions>

        <Alert
          message="Information importante"
          description="Ce lien est à usage unique. Une fois votre CRA validé, vous ne pourrez plus modifier les informations."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {error && (
          <Alert
            message="Erreur"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            label={<strong>Nombre de jours travaillés</strong>}
            name="joursTravailles"
            rules={[
              { required: true, message: 'Veuillez saisir le nombre de jours travaillés' },
              { type: 'number', min: 1, message: 'Le nombre de jours doit être au minimum 1' },
              { type: 'number', max: 31, message: 'Le nombre de jours ne peut pas dépasser 31' },
            ]}
            extra="Saisissez le nombre de jours que vous avez travaillés ce mois-ci"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={31}
              placeholder="Ex: 20"
              size="large"
              precision={0}
              onChange={(value) => {
                if (value && tokenData.tauxJournalier) {
                  const montant = value * tokenData.tauxJournalier;
                  console.log(`Montant calculé: ${montant}€`);
                }
              }}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate>
            {() => {
              const jours = form.getFieldValue('joursTravailles');
              if (jours && tokenData.tauxJournalier) {
                const montantHT = jours * tokenData.tauxJournalier;
                const montantTVA = montantHT * 0.2;
                const montantTTC = montantHT + montantTVA;

                return (
                  <Alert
                    message="Montant estimé de la facture"
                    description={
                      <div>
                        <p style={{ marginBottom: 4 }}>
                          <strong>Montant HT :</strong> {montantHT.toFixed(2)}€
                        </p>
                        <p style={{ marginBottom: 4 }}>
                          <strong>TVA (20%) :</strong> {montantTVA.toFixed(2)}€
                        </p>
                        <p style={{ marginBottom: 0, fontSize: '16px' }}>
                          <strong>Montant TTC :</strong> <span style={{ color: '#52c41a', fontSize: '18px' }}>{montantTTC.toFixed(2)}€</span>
                        </p>
                      </div>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              block
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {submitting ? 'Enregistrement en cours...' : 'Valider mon CRA'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            En validant ce formulaire, vous confirmez que les informations saisies sont exactes.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default SaisieCRAPage;
