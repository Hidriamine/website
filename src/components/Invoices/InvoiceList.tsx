import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Select } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useData } from '../../context/DataContext';
import { Facture, StatutFacture } from '../../types';
import { formaterMontant, estEnRetard } from '../../utils/invoiceUtils';
import InvoiceForm from './InvoiceForm';
import InvoicePreview from './InvoicePreview';
import { exporterFacturePDF } from './InvoicePdfExporter';
import { facturesApi } from '../../services/apiClient';
import dayjs from 'dayjs';

const InvoiceList: React.FC = () => {
  const { factures, supprimerFacture, modifierFacture, getClientById, entreprise } = useData();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Facture | null>(null);

  // Vérifier et mettre à jour les factures en retard
  useEffect(() => {
    factures.forEach(facture => {
      if (estEnRetard(facture) && facture.statut !== 'payee' && facture.statut !== 'annulee' && facture.statut !== 'non_payee') {
        modifierFacture(facture.id, { statut: 'non_payee' });
      }
    });
  }, [factures, modifierFacture]);

  const handleDelete = (id: string): void => {
    supprimerFacture(id);
    message.success('Facture supprimée avec succès');
  };

  const handlePreview = (facture: Facture): void => {
    setSelectedInvoice(facture);
    setIsPreviewOpen(true);
  };

  const handleStatutChange = async (factureId: string, nouveauStatut: StatutFacture): Promise<void> => {
    const factureActuelle = factures.find(f => f.id === factureId);
    const ancienStatut = factureActuelle?.statut;

    // Mettre à jour le statut
    modifierFacture(factureId, { statut: nouveauStatut });
    message.success('Statut mis à jour');

    // Si le nouveau statut est "envoyee" et différent de l'ancien statut, envoyer l'email
    if (nouveauStatut === 'envoyee' && ancienStatut !== 'envoyee') {
      try {
        message.loading({ content: 'Envoi de l\'email en cours...', key: 'email' });

        const data = await facturesApi.sendEmail(factureId);

        message.success({
          content: `Email envoyé avec succès à ${data.destinataire}`,
          key: 'email',
          duration: 5,
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        message.error({
          content: 'Erreur lors de l\'envoi de l\'email',
          key: 'email',
          duration: 5,
        });
      }
    }
  };

  const handleExportPDF = (facture: Facture): void => {
    const client = getClientById(facture.clientId);
    if (!client) {
      message.error('Client introuvable');
      return;
    }
    if (!entreprise) {
      message.error('Informations entreprise introuvables');
      return;
    }
    exporterFacturePDF(facture, client, entreprise);
    // Mettre à jour le statut à "envoyée" après le téléchargement du PDF
    if (facture.statut !== 'envoyee') {
      modifierFacture(facture.id, { statut: 'envoyee' });
      message.success('Statut mis à jour : Envoyée');
    }
  };

  const columns: ColumnsType<Facture> = [
    {
      title: 'Numéro',
      dataIndex: 'numero',
      key: 'numero',
      sorter: (a, b) => a.numero.localeCompare(b.numero),
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
      filters: [...new Set(factures.map(f => f.clientId))].map(clientId => {
        const client = getClientById(clientId);
        return {
          text: client ? client.nom : 'Inconnu',
          value: clientId,
        };
      }),
      onFilter: (value, record) => record.clientId === value,
    },
    {
      title: 'Date émission',
      dataIndex: 'dateEmission',
      key: 'dateEmission',
      sorter: (a, b) => dayjs(a.dateEmission).unix() - dayjs(b.dateEmission).unix(),
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Date échéance',
      dataIndex: 'dateEcheance',
      key: 'dateEcheance',
      sorter: (a, b) => dayjs(a.dateEcheance).unix() - dayjs(b.dateEcheance).unix(),
      render: (date: string, record: Facture) => {
        const isLate = estEnRetard(record);
        return (
          <span style={{ color: isLate ? '#ff4d4f' : 'inherit' }}>
            {dayjs(date).format('DD/MM/YYYY')}
            {isLate && <span style={{ marginLeft: 4 }}>⚠️</span>}
          </span>
        );
      },
    },
    {
      title: 'Total HT',
      dataIndex: 'totalHT',
      key: 'totalHT',
      align: 'right',
      sorter: (a, b) => a.totalHT - b.totalHT,
      render: (montant: number) => formaterMontant(montant),
    },
    {
      title: 'TVA',
      dataIndex: 'montantTVA',
      key: 'montantTVA',
      align: 'right',
      render: (montant: number) => formaterMontant(montant),
    },
    {
      title: 'Total TTC',
      dataIndex: 'totalTTC',
      key: 'totalTTC',
      align: 'right',
      sorter: (a, b) => a.totalTTC - b.totalTTC,
      render: (montant: number) => <strong>{formaterMontant(montant)}</strong>,
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut: StatutFacture, record: Facture) => (
        <Select
          value={statut}
          onChange={(value) => handleStatutChange(record.id, value)}
          style={{ width: 130 }}
          size="small"
        >
          <Select.Option value="brouillon">
            <Tag color="default">Brouillon</Tag>
          </Select.Option>
          <Select.Option value="envoyee">
            <Tag color="processing">Envoyée</Tag>
          </Select.Option>
          <Select.Option value="payee">
            <Tag color="success">Payée</Tag>
          </Select.Option>
          <Select.Option value="non_payee">
            <Tag color="error">Non payée</Tag>
          </Select.Option>
          <Select.Option value="annulee">
            <Tag color="default">Annulée</Tag>
          </Select.Option>
        </Select>
      ),
      filters: [
        { text: 'Brouillon', value: 'brouillon' },
        { text: 'Envoyée', value: 'envoyee' },
        { text: 'Payée', value: 'payee' },
        { text: 'Non payée', value: 'non_payee' },
        { text: 'Annulée', value: 'annulee' },
      ],
      onFilter: (value, record) => record.statut === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            Voir
          </Button>
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            onClick={() => handleExportPDF(record)}
          >
            PDF
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer cette facture ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsFormOpen(true)}
        >
          Nouvelle Facture
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={factures}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} factures`,
        }}
        scroll={{ x: 1400 }}
        summary={(pageData) => {
          const totalHT = pageData.reduce((sum, item) => sum + item.totalHT, 0);
          const totalTVA = pageData.reduce((sum, item) => sum + item.montantTVA, 0);
          const totalTTC = pageData.reduce((sum, item) => sum + item.totalTTC, 0);

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <strong>Total</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4} align="right">
                <strong>{formaterMontant(totalHT)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} align="right">
                <strong>{formaterMontant(totalTVA)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong>{formaterMontant(totalTTC)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} colSpan={2} />
            </Table.Summary.Row>
          );
        }}
      />

      <InvoiceForm
        open={isFormOpen}
        onCancel={() => setIsFormOpen(false)}
      />

      <InvoicePreview
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        facture={selectedInvoice}
      />
    </>
  );
};

export default InvoiceList;