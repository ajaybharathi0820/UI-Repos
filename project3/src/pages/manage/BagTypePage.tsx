import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'name', label: 'Bag Type Name', type: 'text' as const, required: true },
  { name: 'code', label: 'Code', type: 'text' as const, required: true },
  { name: 'expectedWeight', label: 'Expected Weight (kg)', type: 'number' as const, required: true },
  { name: 'tolerance', label: 'Tolerance (kg)', type: 'number' as const, required: true },
];

const validationSchema = yup.object({
  name: yup.string().required('Bag type name is required'),
  code: yup.string().required('Code is required'),
  expectedWeight: yup.number()
    .positive('Expected weight must be positive')
    .required('Expected weight is required'),
  tolerance: yup.number()
    .positive('Tolerance must be positive')
    .required('Tolerance is required'),
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