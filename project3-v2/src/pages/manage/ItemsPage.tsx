import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'productCode', label: 'Product Code', type: 'text' as const, required: true },
  { name: 'name', label: 'Product Name', type: 'text' as const, required: true },
  { name: 'weight', label: 'Weight (kg)', type: 'number' as const, required: true },
];

const validationSchema = yup.object({
  productCode: yup.string().required('Product code is required'),
  name: yup.string().required('Product name is required'),
  weight: yup.number()
    .positive('Weight must be positive')
    .required('Weight is required'),
});

export function ItemsPage() {
  return (
    <CrudPage
      entityType="product"
      entityName="Product"
      fields={fields}
      validationSchema={validationSchema}
    />
  );
}