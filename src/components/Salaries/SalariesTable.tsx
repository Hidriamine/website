import React, { useState } from 'react';
import { Table, Button, Space, Popconfirm, Tag, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useData } from '../../context/DataContext';
import { Salarie } from '../../types';
import SalaryForm from './SalaryForm';

const SalariesTable: React.FC = () => {
  const { salaries, supprimerSalarie, getClientById } = useData();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [salaryToEdit, setSalaryToEdit] = useState<Salarie | null>(null);

  const handleEdit = (salarie: Salarie): void => {
    setSalaryToEdit(salarie);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string): void => {
    supprimerSalarie(id);
    message.success('Salarié supprimé avec succès');
  };

  const handleModalClose = (): void => {
    setIsModalOpen(false);
    setSalaryToEdit(null);
  };

  const columns: ColumnsType<Salarie> = [
    {
      title: 'Prénom',
      dataIndex: 'prenom',
      key: 'prenom',
      sorter: (a, b) => a.prenom.localeCompare(b.prenom),
    },
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Poste',
      dataIndex: 'poste',
      key: 'poste',
      render: (poste: string) => <Tag color="purple">{poste}</Tag>,
    },
    {
      title: 'Taux journalier',
      dataIndex: 'tauxJournalier',
      key: 'tauxJournalier',
      align: 'right',
      sorter: (a, b) => a.tauxJournalier - b.tauxJournalier,
      render: (taux: number) => <strong>{taux} €/jour</strong>,
    },
    {
      title: 'Client',
      dataIndex: 'clientId',
      key: 'clientId',
      render: (clientId: string) => {
        const client = getClientById(clientId);
        return client ? <Tag color="blue">{client.nom}</Tag> : '-';
      },
      filters: [...new Set(salaries.map(s => s.clientId))].map(clientId => {
        const client = getClientById(clientId);
        return {
          text: client ? client.nom : 'Inconnu',
          value: clientId,
        };
      }),
      onFilter: (value, record) => record.clientId === value,
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
            title="Êtes-vous sûr de vouloir supprimer ce salarié ?"
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
          Nouveau Salarié
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={salaries}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total} salariés`,
        }}
        scroll={{ x: 1200 }}
      />

      <SalaryForm
        open={isModalOpen}
        onCancel={handleModalClose}
        salarie={salaryToEdit}
      />
    </>
  );
};

export default SalariesTable;