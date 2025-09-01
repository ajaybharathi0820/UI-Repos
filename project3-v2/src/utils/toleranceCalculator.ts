export interface ToleranceResult {
  status: 'within' | 'below' | 'above';
  message: string;
  netWeight: number;
  expectedWeight: number;
  allowedDeviation: number;
  difference: number;
}

export function calculateTolerance(
  grossWeight: number,
  bagWeight: number,
  dozens: number,
  standardWeight: number
): ToleranceResult {
  const netWeight = grossWeight - bagWeight;
  const expectedWeight = dozens * standardWeight;
  const allowedDeviation = expectedWeight * 0.02; // 2% tolerance
  const difference = netWeight - expectedWeight;

  let status: 'within' | 'below' | 'above';
  let message: string;

  if (netWeight < expectedWeight - allowedDeviation) {
    status = 'below';
    message = 'Below Tolerance';
  } else if (netWeight > expectedWeight + allowedDeviation) {
    status = 'above';
    message = 'Above Tolerance';
  } else {
    status = 'within';
    message = 'Within Tolerance';
  }

  return {
    status,
    message,
    netWeight,
    expectedWeight,
    allowedDeviation,
    difference
  };
}