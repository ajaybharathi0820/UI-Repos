import { polishers, items, bagTypes } from './mockData';

export type AssignmentStatus = 'open' | 'completed' | 'in-progress';

export interface PolisherAssignmentEntry {
  id: string;
  itemCode: string;
  itemName: string;
  bagType: string;     // display name
  bagTypeId?: string;  // optional id
  dozens: number;
  bagWeight: number;
  totalWeight: number; // gross/total weight in kg
}

export interface PolisherAssignment {
  id: string;
  polisherId: string;
  polisherName: string;
  date: string; // ISO string
  status: AssignmentStatus;
  entries: PolisherAssignmentEntry[];
}

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }
function pickMany<T>(arr: T[], n: number): T[] {
  const res: T[] = [];
  const idxs = new Set<number>();
  const take = Math.min(n, arr.length);
  while (res.length < take) {
    const i = Math.floor(Math.random() * arr.length);
    if (!idxs.has(i)) { idxs.add(i); res.push(arr[i]); }
  }
  return res;
}
const toISO = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString(); };

const defaultBag: any = bagTypes[0] ?? { id: 1, type: 'Bag', weight: 0.5 };

function buildEntries(count: number): PolisherAssignmentEntry[] {
  return pickMany(items, count).map((it, idx) => {
    const bt: any = defaultBag;
    return {
      id: `${it.code}-${idx}`,
      itemCode: it.code,
      itemName: it.name,
      bagType: (typeof bt.type === 'string' ? bt.type : (bt.name ?? 'Bag')) as string,
      bagTypeId: (bt.id ?? '1').toString(),
      dozens: Math.floor(rnd(1, 10)),
      bagWeight: Number((bt.weight ?? 0.5).toFixed(3)),
      totalWeight: Number(rnd(1, 7).toFixed(3)),
    };
  });
}

export const mockAssignments: PolisherAssignment[] = [
  {
    id: 'PA-1003',
    polisherId: (polishers[0]?.id ?? 1).toString(),
    polisherName: polishers[0]?.name ?? 'Polisher A',
    date: toISO(0),
    status: 'in-progress',
    entries: buildEntries(5),
  },
  {
    id: 'PA-1002',
    polisherId: (polishers[1]?.id ?? 2).toString(),
    polisherName: polishers[1]?.name ?? 'Polisher B',
    date: toISO(2),
    status: 'completed',
    entries: buildEntries(3),
  },
  {
    id: 'PA-1001',
    polisherId: (polishers[0]?.id ?? 1).toString(),
    polisherName: polishers[0]?.name ?? 'Polisher A',
    date: toISO(7),
    status: 'completed',
    entries: buildEntries(6),
  },
];
