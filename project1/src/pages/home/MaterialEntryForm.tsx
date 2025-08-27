import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import ApiService from '../../services/api';
import { MaterialEntry } from '../../types';

const schema = yup.object({
  itemCode: yup.string().required('Item code is required'),
  bagType: yup.string().required('Bag type is required'),
  dozens: yup.number()
    .positive('Dozens must be greater than 0')
    .required('Dozens is required'),
  weight: yup.number()
    .positive('Weight must be greater than 0')
    .required('Weight is required'),
});

interface MaterialEntryFormData {
  itemCode: string;
  bagType: string;
  dozens: number;
  weight: number;
}

interface MaterialEntryFormProps {
  onSubmit: (data: MaterialEntry) => void;
}

const bagTypeOptions = [
  { value: 'small', label: 'Small Bag' },
  { value: 'medium', label: 'Medium Bag' },
  { value: 'large', label: 'Large Bag' },
  { value: 'jumbo', label: 'Jumbo Bag' },
];

// Mock expected weights and tolerance
const expectedWeights: Record<string, { weight: number; tolerance: number }> = {
  small: { weight: 5.0, tolerance: 0.2 },
  medium: { weight: 10.0, tolerance: 0.3 },
  large: { weight: 20.0, tolerance: 0.5 },
  jumbo: { weight: 50.0, tolerance: 1.0 },
};

export function MaterialEntryForm({ onSubmit }: MaterialEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toleranceModal, setToleranceModal] = useState<{
    isOpen: boolean;
    message: string;
    data?: MaterialEntryFormData;
  }>({ isOpen: false, message: '' });

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<MaterialEntryFormData>({
    resolver: yupResolver(schema),
  });

  const bagType = watch('bagType');
  const weight = watch('weight');

  const checkTolerance = (data: MaterialEntryFormData) => {
    const expected = expectedWeights[data.bagType];
    if (!expected) return true;

    const difference = Math.abs(data.weight - expected.weight);
    const isOutOfTolerance = difference > expected.tolerance;

    if (isOutOfTolerance) {
      const message = `Weight is out of tolerance!\nExpected: ${expected.weight}kg (±${expected.tolerance}kg)\nActual: ${data.weight}kg\nDifference: ${difference.toFixed(2)}kg`;
      setToleranceModal({
        isOpen: true,
        message,
        data
      });
      return false;
    }

    return true;
  };

  const submitForm = async (data: MaterialEntryFormData, force = false) => {
    if (!force && !checkTolerance(data)) return;

    setIsLoading(true);
    
    try {
      // Mock API call
      const newEntry: MaterialEntry = {
        id: Date.now().toString(),
        itemCode: data.itemCode,
        bagType: data.bagType,
        dozens: data.dozens,
        weight: data.weight,
        expectedWeight: expectedWeights[data.bagType]?.weight,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      onSubmit(newEntry);
      toast.success('Material entry added successfully!');
      reset();
      setToleranceModal({ isOpen: false, message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add material entry';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (data: MaterialEntryFormData) => {
    submitForm(data);
  };

  const handleForceSubmit = () => {
    if (toleranceModal.data) {
      submitForm(toleranceModal.data, true);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Material Entry</h2>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Input
            label="Item Code"
            type="text"
            placeholder="Enter item code"
            required
            {...register('itemCode')}
            error={errors.itemCode?.message}
          />

          <Select
            label="Bag Type"
            required
            options={bagTypeOptions}
            {...register('bagType')}
            error={errors.bagType?.message}
          />

          <Input
            label="Dozens"
            type="number"
            step="1"
            min="1"
            placeholder="Enter dozens"
            required
            {...register('dozens', { valueAsNumber: true })}
            error={errors.dozens?.message}
          />

          <div className="space-y-2">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter weight"
              required
              {...register('weight', { valueAsNumber: true })}
              error={errors.weight?.message}
            />
            {bagType && weight && expectedWeights[bagType] && (
              <p className="text-xs text-gray-500">
                Expected: {expectedWeights[bagType].weight}kg (±{expectedWeights[bagType].tolerance}kg)
              </p>
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <Button
              type="submit"
              loading={isLoading}
              className="px-8"
            >
              Add Entry
            </Button>
          </div>
        </form>
      </div>

      <Modal
        isOpen={toleranceModal.isOpen}
        onClose={() => setToleranceModal({ isOpen: false, message: '' })}
        title="Tolerance Check"
      >
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <pre className="text-sm text-yellow-800 whitespace-pre-line">{toleranceModal.message}</pre>
          </div>
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setToleranceModal({ isOpen: false, message: '' })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleForceSubmit}
              loading={isLoading}
            >
              Submit Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}