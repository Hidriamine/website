import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, DatePicker, InputNumber, message, Divider, Descriptions, Space, Alert } from 'antd';
import type { Dayjs } from 'dayjs';
import { useData } from '../../context/DataContext';
import { Salarie, StatutFacture } from '../../types';
import { calculerMontantsFacture, calculerLigneFacture, calculerDateEcheance, formaterMontant } from '../../utils/invoiceUtils';
import dayjs from 'dayjs';

interface InvoiceFormProps {
  open: boolean;
  onCancel: () => void;
}

interface FormValues {
  salarieId: string;
  dateEmission: Dayjs;
  quantite: number;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm<FormValues>();
  const { salaries, getClientById, ajouterFacture } = useData();
  
  const [salarieSelectionne, setSalarieSelectionne] = useState<Salarie | null>(null);
  const [dateEmission, setDateEmission] = useState<Dayjs | null>(null);
  const [quantite, setQuantite] = useState<number>(0);
  const [montantHT, setMontantHT] = useState<number>(0);
  const [totaux, setTotaux] = useState({ totalHT: 0, montantTVA: 0, totalTTC: 0 });

  useEffect(() => {
    if (open) {
      form.resetFields();
      setSalarieSelectionne(null);
      setDateEmission(null);
      setQuantite(0);
      setMontantHT(0);
      setTotaux({ totalHT: 0, montantTVA: 0, totalTTC: 0 });
      form.setFieldsValue({
        dateEmission: dayjs(),
        quantite: 0,
      } as Partial<FormValues>);
    }
  }, [open, form]);

  // Recalculer les montants quand quantite change
  useEffect(() => {
    if (salarieSelectionne && quantite > 0) {
      const nouveauMontantHT = calculerLigneFacture(quantite, salarieSelectionne.tauxJournalier);
      setMontantHT(nouveauMontantHT);
      
      const ligne = {
        id: '1',
        designation: salarieSelectionne.poste,
        quantite: quantite,
        prixUnitaire: salarieSelectionne.tauxJournalier,
        montantHT: nouveauMontantHT,
      };
      
      const nouveauxTotaux = calculerMontantsFacture([ligne]);
      setTotaux(nouveauxTotaux);
    } else {
      setMontantHT(0);
      setTotaux({ totalHT: 0, montantTVA: 0, totalTTC: 0 });
    }
  }, [salarieSelectionne, quantite]);

  const handleSalarieChange = (salarieId: string): void => {
    const salarie = salaries.find(s => s.id === salarieId);
    setSalarieSelectionne(salarie || null);
  };

  const handleDateEmissionChange = (date: Dayjs | null): void => {
    setDateEmission(date);
  };

  const handleQuantiteChange = (value: number | null): void => {
    setQuantite(value || 0);
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      
      if (!salarieSelectionne) {
        message.error('Veuillez sélectionner un salarié');
        return;
      }

      if (!values.dateEmission) {
        message.error('Veuillez saisir la date d\'émission');
        return;
      }

      if (!values.quantite || values.quantite <= 0) {
        message.error('Veuillez saisir une quantité supérieure à 0');
        return;
      }

      const client = getClientById(salarieSelectionne.clientId);
      if (!client) {
        message.error('Client non trouvé');
        return;
      }

      const dateEcheance = calculerDateEcheance(
        values.dateEmission.format('YYYY-MM-DD'), 
        client.delaiFacturation
      );

      const ligne = {
        id: String(Date.now()),
        designation: salarieSelectionne.poste,
        quantite: values.quantite,
        prixUnitaire: salarieSelectionne.tauxJournalier,
        montantHT: montantHT,
      };

      const nouvelleFacture = {
        clientId: salarieSelectionne.clientId,
        dateEmission: values.dateEmission.format('YYYY-MM-DD'),
        dateEcheance: dateEcheance,
        lignes: [ligne],
        totalHT: totaux.totalHT,
        tauxTVA: 20,
        montantTVA: totaux.montantTVA,
        totalTTC: totaux.totalTTC,
        statut: 'brouillon' as StatutFacture, // Statut par défaut
        reference: salarieSelectionne.reference, // Référence du salarié
      };

      ajouterFacture(nouvelleFacture);
      message.success('Facture créée avec succès');
      onCancel();
    } catch (error) {
      console.error('Erreur lors de la création de la facture:', error);
    }
  };

  const client = salarieSelectionne ? getClientById(salarieSelectionne.clientId) : null;
  const dateEcheance = salarieSelectionne && client && dateEmission 
    ? calculerDateEcheance(dateEmission.format('YYYY-MM-DD'), client.delaiFacturation)
    : null;

  return (
    <Modal
      title="Nouvelle facture"
      open={open}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="Créer la facture"
      cancelText="Annuler"
      width={800}
    >
      <Form form={form} layout="vertical">
        <Alert
          message="Création de facture simplifiée"
          description="Sélectionnez un salarié et remplissez la date d'émission et la quantité de jours. Le reste sera calculé automatiquement."
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {/* CHAMPS À REMPLIR */}
        <div style={{ backgroundColor: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0 }}>Informations à remplir</h3>
          
          <Form.Item
            name="salarieId"
            label="Sélectionner un salarié"
            rules={[{ required: true, message: 'Le salarié est obligatoire' }]}
          >
            <Select
              showSearch
              placeholder="Choisir un salarié"
              optionFilterProp="children"
              onChange={handleSalarieChange}
              filterOption={(input, option) => {
                const children = option?.children;
                if (typeof children === 'string') {
                  return (children as string).toLowerCase().includes(input.toLowerCase());
                }
                return false;
              }}
            >
              {salaries.map((salarie) => (
                <Select.Option key={salarie.id} value={salarie.id}>
                  {salarie.prenom} {salarie.nom} - {salarie.poste}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Space size="large">
            <Form.Item
              name="dateEmission"
              label="Date d'émission"
              rules={[{ required: true, message: 'La date d\'émission est obligatoire' }]}
            >
              <DatePicker 
                format="DD/MM/YYYY"
                onChange={handleDateEmissionChange}
                style={{ width: 200 }}
              />
            </Form.Item>

            <Form.Item
              name="quantite"
              label="Quantité (jours travaillés)"
              rules={[
                { required: true, message: 'La quantité est obligatoire' },
                { type: 'number', min: 0.1, message: 'La quantité doit être supérieure à 0' }
              ]}
            >
              <InputNumber
                min={0}
                precision={2}
                style={{ width: 150 }}
                placeholder="Ex: 15"
                onChange={handleQuantiteChange}
              />
            </Form.Item>
          </Space>
        </div>

        {/* INFORMATIONS CALCULÉES AUTOMATIQUEMENT */}
        {salarieSelectionne && client && (
          <>
            <Divider>Informations calculées automatiquement</Divider>

            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Client" span={2}>
                <strong>{client.nom}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Désignation" span={2}>
                {salarieSelectionne.poste}
              </Descriptions.Item>
              {salarieSelectionne.reference && (
                <Descriptions.Item label="Référence" span={2}>
                  <strong>{salarieSelectionne.reference}</strong>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Taux journalier">
                {formaterMontant(salarieSelectionne.tauxJournalier)} / jour
              </Descriptions.Item>
              <Descriptions.Item label="Quantité">
                {quantite > 0 ? `${quantite} jour${quantite > 1 ? 's' : ''}` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Date d'échéance" span={2}>
                {dateEcheance ? (
                  <>
                    {dayjs(dateEcheance).format('DD/MM/YYYY')}
                    <span style={{ color: '#666', fontSize: '12px', marginLeft: 8 }}>
                      ({client.delaiFacturation} jours après émission)
                    </span>
                  </>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Calcul des montants</Divider>

            <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                  <span>Montant HT:</span>
                  <strong>{formaterMontant(montantHT)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                  <span>TVA (20%):</span>
                  <strong>{formaterMontant(totaux.montantTVA)}</strong>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#1890ff' }}>
                  <span><strong>Total TTC:</strong></span>
                  <strong>{formaterMontant(totaux.totalTTC)}</strong>
                </div>
              </Space>
            </div>

            {quantite > 0 && (
              <Alert
                message="Résumé"
                description={
                  <div>
                    <strong>{salarieSelectionne.prenom} {salarieSelectionne.nom}</strong> - {salarieSelectionne.poste}
                    <br />
                    {quantite} jour{quantite > 1 ? 's' : ''} × {formaterMontant(salarieSelectionne.tauxJournalier)} = {formaterMontant(montantHT)}
                  </div>
                }
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default InvoiceForm;