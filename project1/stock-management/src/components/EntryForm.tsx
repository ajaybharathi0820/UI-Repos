import { useState, useEffect } from 'react';
import type { BagType, Item, MaterialEntry } from '../types';
import '../css/EntryForm.css';
import Select from 'react-select';

interface Props {
  items: Item[];
  bagTypes: BagType[];
  onAdd: (entry: MaterialEntry) => void;
  initialData?: Partial<MaterialEntry> | null;
}

let idCounter = 1;

export default function EntryForm({ items, bagTypes, onAdd, initialData }: Props) {
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [bagType, setBagType] = useState('');
  const [dozens, setDozens] = useState<number | ''>('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemOptions = items.map((item) => ({
    value: item.code,
    label: `${item.code} - ${item.name}`,
  }));

  useEffect(() => {
    if (initialData) {
      setItemCode(initialData.itemCode ?? '');
      setItemName(initialData.itemName ?? '');
      setBagType(initialData.bagType ?? '');
      setDozens(initialData.dozens ?? '');
      setTotalWeight(initialData.totalWeight ?? '');
    }
  }, [initialData]);

  useEffect(() => {
    const item = items.find(i => i.code === itemCode);
    if (item) setItemName(item.name);
  }, [itemCode, items]);

  useEffect(() => {
    const item = items.find(i => i.name === itemName);
    if (item) setItemCode(item.code);
  }, [itemName, items]);

  const isFormValid = itemCode && bagType && dozens && totalWeight;

  const handleAdd = async () => {
    if (!isFormValid) return;
    
    setIsSubmitting(true);
    
    try {
      const item = items.find(i => i.code === itemCode);
      const bag = bagTypes.find(b => b.type === bagType);
      if (!item || !bag) return;

      const netWeight = totalWeight - bag.weight;
      const avgWeight = netWeight / dozens;
      const toleranceDiff = avgWeight - item.standardWeight;

      const newEntry: MaterialEntry = {
        id: idCounter++,
        itemCode: item.code,
        itemName: item.name,
        bagType: bag.type,
        bagWeight: bag.weight,
        dozens,
        totalWeight,
        netWeight,
        avgWeight,
        toleranceDiff,
      };

      onAdd(newEntry);
      
      // Reset form
      setItemCode('');
      setItemName('');
      setBagType('');
      setDozens('');
      setTotalWeight('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setItemCode('');
    setItemName('');
    setBagType('');
    setDozens('');
    setTotalWeight('');
  };

  return (
    <div className="entry-form animate-fade-in">
      <div className="form-header">
        <div className="form-icon">➕</div>
        <h3 className="form-title">Add Material Entry</h3>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Item Selection</label>
          <div className="form-select-wrapper">
            <Select
              className="form-select-dropdown"
              options={itemOptions}
              value={itemCode ? itemOptions.find(opt => opt.value === itemCode) : null}
              onChange={(selected) => {
                if (selected) {
                  const item = items.find(i => i.code === selected.value);
                  if (item) {
                    setItemCode(item.code);
                    setItemName(item.name);
                  }
                } else {
                  setItemCode('');
                  setItemName('');
                }
              }}
              isClearable
              placeholder="Search item by name or code..."
              isSearchable
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="bag-type">Bag Type</label>
          <select
            id="bag-type"
            className="form-select"
            value={bagType}
            onChange={(e) => setBagType(e.target.value)}
          >
            <option value="">Select bag type...</option>
            {bagTypes.map(b => (
              <option key={b.id} value={b.type}>
                {b.type} ({b.weight}kg)
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="dozens">Dozens</label>
          <input
            id="dozens"
            className="form-input"
            type="number"
            placeholder="Enter dozens"
            value={dozens}
            onChange={(e) => setDozens(e.target.value === '' ? '' : Number(e.target.value))}
            min="1"
            step="1"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="total-weight">Total Weight (kg)</label>
          <input
            id="total-weight"
            className="form-input"
            type="number"
            placeholder="Enter total weight"
            value={totalWeight}
            onChange={(e) => setTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
            min="0"
            step="0.001"
          />
        </div>
      </div>

      <div className="form-actions">
        <button 
          type="button"
          className="btn btn-secondary" 
          onClick={handleReset}
          disabled={isSubmitting}
        >
          🔄 Reset
        </button>
        <button 
          type="button"
          className="btn btn-primary" 
          onClick={handleAdd}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="loading-spinner"></div>
              Adding...
            </>
          ) : (
            <>
              ➕ Add Entry
            </>
          )}
        </button>
      </div>
    </div>
  );
}