export interface RawMaterial {
    id: number;
    name: string;
    quantity: number;
    weight: number;
    scrap: number;
    polisher: string; 
  }
  
export interface Polisher {
  id: number;
  name: string;
}

export interface BagType {
  id: number;
  type: string;
  weight: number;
}

export interface Item {
  code: string;
  name: string;
  standardWeight: number;
}

export interface MaterialEntry {
  id: number;
  itemCode: string;
  itemName: string;
  bagType: string;
  bagWeight: number;
  dozens: number;
  totalWeight: number;
  netWeight: number;
  avgWeight: number;
  toleranceDiff: number;
}

