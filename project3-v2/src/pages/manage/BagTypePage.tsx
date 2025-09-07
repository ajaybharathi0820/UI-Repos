import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'name', label: 'Bag Type Name', type: 'text' as const, required: true },
  { name: 'weight', label: 'Weight (kg)', type: 'number' as const, required: true },
];

const validationSchema = yup.object({
  name: yup.string().required('Bag type name is required'),
  weight: yup.number()
    .positive('Weight must be positive')
    .required('Weight is required'),
});

export function BagTypePage() {
  return (
    <CrudPage
      entityType="bag-type"
      entityName="Bag Type"
      fields={fields}
      validationSchema={validationSchema}
    />
  );
}