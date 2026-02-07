import React from 'react';
import { Modal, Descriptions, Table, Tag, Button, Space, Divider } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useData } from '../../context/DataContext';
import { Facture, LigneFacture } from '../../types';
import { formaterMontant, getStatutLabel, getStatutColor } from '../../utils/invoiceUtils';
import { exporterFacturePDF } from './InvoicePdfExporter';
import dayjs from 'dayjs';

interface InvoicePreviewProps {
  open: boolean;
  onCancel: () => void;
  facture: Facture | null;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ open, onCancel, facture }) => {
  const { getClientById, entreprise } = useData();

  if (!facture) return null;

  const client = getClientById(facture.clientId);

  const handleExportPDF = (): void => {
    if (client && entreprise) {
      exporterFacturePDF(facture, client, entreprise);
    } else {
      console.error('Client ou entreprise non trouvé');
    }
  };

  const colonnesLignes: ColumnsType<LigneFacture> = [
    {
      title: 'Désignation',
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: 'Quantité (jours)',
      dataIndex: 'quantite',
      key: 'quantite',
      align: 'right',
    },
    {
      title: 'Prix unitaire (€/jour)',
      dataIndex: 'prixUnitaire',
      key: 'prixUnitaire',
      align: 'right',
      render: (prix: number) => formaterMontant(prix),
    },
    {
      title: 'Montant HT',
      dataIndex: 'montantHT',
      key: 'montantHT',
      align: 'right',
      render: (montant: number) => <strong>{formaterMontant(montant)}</strong>,
    },
  ];

  return (
    <Modal
      title={`Facture ${facture.numero}`}
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="export" type="primary" icon={<FilePdfOutlined />} onClick={handleExportPDF}>
          Exporter en PDF
        </Button>,
        <Button key="close" onClick={onCancel}>
          Fermer
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Informations client */}
        <div>
          <h3>Client</h3>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Nom">{client?.nom || '-'}</Descriptions.Item>
            <Descriptions.Item label="SIRET">{client?.siret || '-'}</Descriptions.Item>
            <Descriptions.Item label="Adresse" span={2}>
              {client?.adresse}, {client?.codePostal} {client?.ville}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{client?.email || '-'}</Descriptions.Item>
          </Descriptions>
        </div>

        {/* Informations facture */}
        <div>
          <h3>Informations de la facture</h3>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Numéro">
              <strong>{facture.numero}</strong>
            </Descriptions.Item>
            <Descriptions.Item label="Statut">
              <Tag color={getStatutColor(facture.statut)}>
                {getStatutLabel(facture.statut)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Date d'émission">
              {dayjs(facture.dateEmission).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Date d'échéance">
              {dayjs(facture.dateEcheance).format('DD/MM/YYYY')}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Lignes de facturation */}
        <div>
          <h3>Détail des prestations</h3>
          <Table
            columns={colonnesLignes}
            dataSource={facture.lignes}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total HT</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong>{formaterMontant(facture.totalHT)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          />
        </div>

        {/* Totaux */}
        <div style={{ textAlign: 'right' }}>
          <Space direction="vertical" style={{ width: 300, textAlign: 'right' }} size="small">
            <div style={{ fontSize: 16 }}>
              <span>Total HT: </span>
              <strong>{formaterMontant(facture.totalHT)}</strong>
            </div>
            <div style={{ fontSize: 16 }}>
              <span>TVA ({facture.tauxTVA}%): </span>
              <strong>{formaterMontant(facture.montantTVA)}</strong>
            </div>
            <Divider style={{ margin: '8px 0' }} />
            <div style={{ fontSize: 20, color: '#1890ff' }}>
              <span>Total TTC: </span>
              <strong>{formaterMontant(facture.totalTTC)}</strong>
            </div>
          </Space>
        </div>
      </Space>
    </Modal>
  );
};

export default InvoicePreview;