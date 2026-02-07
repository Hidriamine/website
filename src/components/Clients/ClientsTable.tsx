import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useData } from '../../context/DataContext';
import { Client } from '../../types';
import ClientForm from './ClientForm';

const ClientsTable: React.FC = () => {
  const { clients, supprimerClient, getSalariesByClientId, getFacturesByClientId } = useData();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const handleEdit = (client: Client): void => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string): void => {
    const salaries = getSalariesByClientId(id);
    const factures = getFacturesByClientId(id);
    
    if (salaries.length > 0 || factures.length > 0) {
      message.error('Impossible de supprimer ce client car il a des salariés ou des factures associés');
      return;
    }
    
    supprimerClient(id);
    message.success('Client supprimé avec succès');
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const columns: ColumnsType<Client> = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      ellipsis: true,
    },
    {
      title: 'Ville',
      dataIndex: 'ville',
      key: 'ville',
      sorter: (a, b) => a.ville.localeCompare(b.ville),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'SIRET',
      dataIndex: 'siret',
      key: 'siret',
    },
    {
      title: 'Délai (jours)',
      dataIndex: 'delaiFacturation',
      key: 'delaiFacturation',
      align: 'center',
      render: (delai: number) => <Tag color="blue">{delai}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce client ?"
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
          onClick={() => setIsModalOpen(true)}
        >
          Nouveau Client
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={clients}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} clients`,
        }}
        scroll={{ x: 1200 }}
      />

      <ClientForm
        open={isModalOpen}
        onCancel={handleModalClose}
        client={clientToEdit}
      />
    </>
  );
};

export default ClientsTable;