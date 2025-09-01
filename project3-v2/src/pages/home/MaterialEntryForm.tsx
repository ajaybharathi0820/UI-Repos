import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'sonner';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { MaterialEntry } from '../../types';
import { bagTypes, items, polishers } from '../../data/mockData';
import { calculateTolerance, ToleranceResult } from '../../utils/toleranceCalculator';

const schema = yup.object({
  itemCode: yup.string().required('Item is required'),
  bagType: yup.string().required('Bag type is required'),
  dozens: yup.number()
    .positive('Dozens must be greater than 0')
    .required('Dozens is required'),
  grossWeight: yup.number()
    .positive('Gross weight must be greater than 0')
    .required('Gross weight is required'),
});

interface MaterialEntryFormData {
  itemCode: string;
  bagType: string;
  dozens: number;
  grossWeight: number;
}

interface MaterialEntryFormProps {
  selectedPolisher: { id: string; name: string } | null;
  onSubmit: (data: MaterialEntry) => void;
}

export function MaterialEntryForm({ selectedPolisher, onSubmit }: MaterialEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [toleranceModal, setToleranceModal] = useState<{
    isOpen: boolean;
    result?: ToleranceResult;
    data?: MaterialEntryFormData;
  }>({ isOpen: false });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<MaterialEntryFormData>({
    resolver: yupResolver(schema),
  });

  const watchedValues = watch();

  // Convert items to searchable options
  const itemOptions = items.map(item => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
    searchText: `${item.code} ${item.name}`,
  }));

  // Convert bag types to select options
  const bagTypeOptions = bagTypes.map(bagType => ({
    value: bagType.id.toString(),
    label: `${bagType.type} (${bagType.weight}kg)`,
  }));

  const getSelectedItem = () => {
    return items.find(item => item.code === watchedValues.itemCode);
  };

  const getSelectedBagType = () => {
    const bagTypeId = parseInt(watchedValues.bagType);
    return bagTypes.find(bagType => bagType.id === bagTypeId);
  };

  const calculateToleranceInfo = () => {
    const selectedItem = getSelectedItem();
    const selectedBagType = getSelectedBagType();
    
    if (!selectedItem || !selectedBagType || !watchedValues.dozens || !watchedValues.grossWeight) {
      return null;
    }

    return calculateTolerance(
      watchedValues.grossWeight,
      selectedBagType.weight,
      watchedValues.dozens,
      selectedItem.standardWeight
    );
  };

  const toleranceInfo = calculateToleranceInfo();

  const checkTolerance = (data: MaterialEntryFormData) => {
    const selectedItem = items.find(item => item.code === data.itemCode);
    const selectedBagType = bagTypes.find(bagType => bagType.id === parseInt(data.bagType));
    
    if (!selectedItem || !selectedBagType) return true;

    const result = calculateTolerance(
      data.grossWeight,
      selectedBagType.weight,
      data.dozens,
      selectedItem.standardWeight
    );

    if (result.status !== 'within') {
      setToleranceModal({
        isOpen: true,
        result,
        data
      });
      return false;
    }

    return true;
  };

  const submitForm = async (data: MaterialEntryFormData, force = false) => {
    if (!force && !checkTolerance(data)) return;

    if (!selectedPolisher) {
      toast.error('No polisher selected');
      return;
    }
    setIsLoading(true);
    
    try {
      const selectedItem = items.find(item => item.code === data.itemCode);
      const selectedBagType = bagTypes.find(bagType => bagType.id === parseInt(data.bagType));
      
      if (!selectedItem || !selectedBagType || !selectedPolisher) {
        throw new Error('Invalid item, bag type, or polisher selection');
      }

      const toleranceResult = calculateTolerance(
        data.grossWeight,
        selectedBagType.weight,
        data.dozens,
        selectedItem.standardWeight
      );

      // Calculate productAvgWeight and toleranceDiff as per requirements
      const productAvgWeight = data.grossWeight / data.dozens;
      const toleranceDiff = productAvgWeight - selectedItem.standardWeight;
      const newEntry: MaterialEntry = {
        id: Date.now().toString(),
        itemCode: data.itemCode,
        itemName: selectedItem.name,
        bagType: selectedBagType.type,
        bagWeight: selectedBagType.weight,
        dozens: data.dozens,
        grossWeight: data.grossWeight,
        netWeight: toleranceResult.netWeight,
        expectedWeight: toleranceResult.expectedWeight,
        toleranceStatus: toleranceResult.status,
        polisherId: selectedPolisher.id,
        polisherName: selectedPolisher.name,
        productAvgWeight,
        toleranceDiff,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      onSubmit(newEntry);
      toast.success('Material entry added successfully!');
      reset();
      setToleranceModal({ isOpen: false });
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

  const getToleranceStatusColor = (status: string) => {
    switch (status) {
      case 'within': return 'text-green-600 bg-green-50';
      case 'below': return 'text-red-600 bg-red-50';
      case 'above': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!selectedPolisher) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center py-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Select a Polisher</h2>
          <p className="text-gray-600">Please select a polisher first to start adding material entries.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Material Entry</h2>
          <div className="text-sm text-gray-600">
            Polisher: <span className="font-medium text-blue-600">{selectedPolisher.name}</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SearchableSelect
              label="Item"
              placeholder="Search by code or name..."
              options={itemOptions}
              value={watchedValues.itemCode || ''}
              onChange={(value) => setValue('itemCode', value)}
              error={errors.itemCode?.message}
              required
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

            <Input
              label="Gross Weight (kg)"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Enter gross weight"
              required
              {...register('grossWeight', { valueAsNumber: true })}
              error={errors.grossWeight?.message}
            />
          </div>

          {/* Tolerance Information */}
          {toleranceInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-900">Tolerance Check</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Net Weight:</span>
                  <span className="ml-2 font-medium">{toleranceInfo.netWeight.toFixed(3)}kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Expected:</span>
                  <span className="ml-2 font-medium">{toleranceInfo.expectedWeight.toFixed(3)}kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Difference:</span>
                  <span className="ml-2 font-medium">{toleranceInfo.difference >= 0 ? '+' : ''}{toleranceInfo.difference.toFixed(3)}kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getToleranceStatusColor(toleranceInfo.status)}`}>
                    {toleranceInfo.message}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
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
        onClose={() => setToleranceModal({ isOpen: false })}
        title="Tolerance Warning"
      >
        <div className="space-y-4">
          {toleranceModal.result && (
            <div className={`border rounded-lg p-4 ${
              toleranceModal.result.status === 'below' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <h4 className={`font-medium mb-2 ${
                toleranceModal.result.status === 'below' ? 'text-red-800' : 'text-orange-800'
              }`}>
                {toleranceModal.result.message}
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Net Weight:</span>
                  <span className="font-medium">{toleranceModal.result.netWeight.toFixed(3)}kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Weight:</span>
                  <span className="font-medium">{toleranceModal.result.expectedWeight.toFixed(3)}kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowed Deviation:</span>
                  <span className="font-medium">±{toleranceModal.result.allowedDeviation.toFixed(3)}kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Difference:</span>
                  <span className="font-medium">
                    {toleranceModal.result.difference >= 0 ? '+' : ''}{toleranceModal.result.difference.toFixed(3)}kg
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-600">
            The weight is outside the acceptable 2% tolerance range. Do you want to submit anyway?
          </p>
          
          <div className="flex space-x-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setToleranceModal({ isOpen: false })}
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