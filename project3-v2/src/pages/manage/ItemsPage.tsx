import React from 'react';
import * as yup from 'yup';
import { CrudPage } from '../../components/manage/CrudPage';

const fields = [
  { name: 'name', label: 'Item Name', type: 'text' as const, required: true },
  { name: 'code', label: 'Item Code', type: 'text' as const, required: true },
  { 
    name: 'category', 
    label: 'Category', 
    type: 'select' as const, 
    required: true,
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'mechanical', label: 'Mechanical' },
      { value: 'textiles', label: 'Textiles' },
      { value: 'consumables', label: 'Consumables' },
    ]
  },
  { name: 'description', label: 'Description', type: 'text' as const },
];

const validationSchema = yup.object({
  name: yup.string().required('Item name is required'),
  code: yup.string().required('Item code is required'),
  category: yup.string().required('Category is required'),
  description: yup.string(),
});

export function ItemsPage() {
  return (
    <CrudPage
      entityType="items"
      entityName="Item"
      fields={fields}
      validationSchema={validationSchema}
    />
  );
}