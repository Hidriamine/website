import React, { useState } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Alert, Space, DatePicker } from 'antd';
import { UserOutlined, TeamOutlined, FileTextOutlined, EuroOutlined, WarningOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useData } from '../context/DataContext';
import { Facture, Salarie } from '../types';
import { formaterMontant, getStatutLabel, getStatutColor, getFacturesEnRetard } from '../utils/invoiceUtils';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';

const Dashboard: React.FC = () => {
  const { getStatistiques, getDernieresFactures, getClientById, factures, getSalariesSansFactureDuMois } = useData();
  const navigate = useNavigate();
  const stats = getStatistiques();
  const dernieresFactures = getDernieresFactures(5);
  const facturesEnRetard = getFacturesEnRetard(factures);

  // État pour le mois sélectionné (par défaut le mois actuel)
  const [moisSelectionne, setMoisSelectionne] = useState<string>(dayjs().format('YYYY-MM'));

  // Obtenir les salariés sans facture pour le mois sélectionné
  const salariesSansFacture = getSalariesSansFactureDuMois(moisSelectionne);

  const facturesColumns: ColumnsType<Facture> = [
    {
      title: 'Numéro',
      dataIndex: 'numero',
      key: 'numero',
      render: (numero: string) => <strong>{numero}</strong>,
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (clientId: string) => {
        const client = getClientById(clientId);
        return client ? client.nom : '-';
      },
    },
    {
      title: 'Date',
      dataIndex: 'dateEmission',
      key: 'dateEmission',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Montant TTC',
      dataIndex: 'totalTTC',
      key: 'totalTTC',
      align: 'right',
      render: (montant: number) => <strong>{formaterMontant(montant)}</strong>,
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <Tag color={getStatutColor(statut)}>
          {getStatutLabel(statut)}
        </Tag>
      ),
    },
  ];

  const salariesColumns: ColumnsType<Salarie> = [
    {
      title: 'Nom',
      key: 'nom',
      render: (_, salarie: Salarie) => `${salarie.prenom} ${salarie.nom}`,
    },
    {
      title: 'Poste',
      dataIndex: 'poste',
      key: 'poste',
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (clientId: string) => {
        const client = getClientById(clientId);
        return client ? <Tag color="blue">{client.nom}</Tag> : '-';
      },
    },
    {
      title: 'Taux journalier',
      dataIndex: 'tauxJournalier',
      key: 'tauxJournalier',
      align: 'right',
      render: (taux: number) => <strong>{taux} €/jour</strong>,
    },
  ];

  // Calculer les statistiques des factures en retard
  const totalEnRetard = facturesEnRetard.reduce((sum, f) => sum + f.totalTTC, 0);

  return (
    <div>
      <h1>Tableau de bord</h1>
      
      {/* Alerte pour les factures en retard */}
      {facturesEnRetard.length > 0 && (
        <Alert
          message={`⚠️ Attention : ${facturesEnRetard.length} facture${facturesEnRetard.length > 1 ? 's' : ''} en retard de paiement`}
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <strong>Montant total en retard :</strong> {formaterMontant(totalEnRetard)}
              </div>
              <div style={{ marginTop: 8 }}>
                {facturesEnRetard.slice(0, 3).map(facture => {
                  const client = getClientById(facture.clientId);
                  const joursRetard = dayjs().diff(dayjs(facture.dateEcheance), 'day');
                  return (
                    <div key={facture.id} style={{ marginBottom: 4 }}>
                      • <strong>{facture.numero}</strong> - {client?.nom} - {formaterMontant(facture.totalTTC)} 
                      <span style={{ color: '#ff4d4f', marginLeft: 8 }}>
                        (retard: {joursRetard} jour{joursRetard > 1 ? 's' : ''})
                      </span>
                    </div>
                  );
                })}
                {facturesEnRetard.length > 3 && (
                  <div style={{ marginTop: 8, fontStyle: 'italic' }}>
                    ... et {facturesEnRetard.length - 3} autre{facturesEnRetard.length - 3 > 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div style={{ marginTop: 12 }}>
                <a onClick={() => navigate('/factures')}>
                  Voir toutes les factures →
                </a>
              </div>
            </Space>
          }
          type="error"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Clients"
              value={stats.nombreClients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Salariés"
              value={stats.nombreSalaries}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Factures"
              value={stats.nombreFactures}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="CA Total TTC"
              value={stats.totalTTC}
              prefix={<EuroOutlined />}
              suffix="€"
              precision={2}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Carte supplémentaire pour les factures en retard */}
      {facturesEnRetard.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Factures en retard"
                value={facturesEnRetard.length}
                prefix={<WarningOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Montant en retard"
                value={totalEnRetard}
                prefix={<EuroOutlined />}
                suffix="€"
                precision={2}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Factures payées"
                value={factures.filter(f => f.statut === 'payee').length}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card
            title={
              <Space>
                <span>Salariés sans facture</span>
                <DatePicker
                  picker="month"
                  value={dayjs(moisSelectionne, 'YYYY-MM')}
                  onChange={(date: Dayjs | null) => {
                    if (date) {
                      setMoisSelectionne(date.format('YYYY-MM'));
                    }
                  }}
                  format="MMMM YYYY"
                  placeholder="Sélectionner un mois"
                  style={{ marginLeft: 16 }}
                />
              </Space>
            }
            extra={
              <Tag color={salariesSansFacture.length > 0 ? 'warning' : 'success'}>
                {salariesSansFacture.length} salarié{salariesSansFacture.length > 1 ? 's' : ''}
              </Tag>
            }
          >
            {salariesSansFacture.length > 0 ? (
              <Table
                columns={salariesColumns}
                dataSource={salariesSansFacture}
                rowKey="id"
                pagination={false}
                size="small"
              />
            ) : (
              <Alert
                message="Tous les salariés ont une facture pour ce mois"
                type="success"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Chiffres clés">
            <Statistic
              title="Total Hors Taxes"
              value={stats.totalHT}
              suffix="€"
              precision={2}
              style={{ marginBottom: 16 }}
            />
            <Statistic
              title="Total TTC"
              value={stats.totalTTC}
              suffix="€"
              precision={2}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Dernières factures">
            <Table
              columns={facturesColumns}
              dataSource={dernieresFactures}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;