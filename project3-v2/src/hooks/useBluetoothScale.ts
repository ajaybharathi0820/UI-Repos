import { useEffect, useMemo, useRef, useState } from 'react';
import { BluetoothScaleService, type WeightReading } from '../services/BluetoothScaleService';

export type ScaleStatus = 'idle' | 'unsupported' | 'connecting' | 'connected' | 'error';

export function useBluetoothScale() {
  const serviceRef = useRef<BluetoothScaleService | null>(null);
  if (!serviceRef.current) serviceRef.current = new BluetoothScaleService();
  const svc = serviceRef.current;

  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<ScaleStatus>('idle');
  const [weight, setWeight] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // simple smoothing using exponential moving average
  const alpha = 0.35;
  const smoothedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!svc.isSupported()) {
      setStatus('unsupported');
    }
  }, [svc]);

  useEffect(() => {
    let mounted = true;

    const onReading = (reading: WeightReading) => {
      if (!mounted) return;
      const current = reading.kg;
      if (typeof current !== 'number' || Number.isNaN(current)) return;
      const prev = smoothedRef.current ?? current;
      const next = prev * (1 - alpha) + current * alpha;
      smoothedRef.current = next;
      setWeight(Number(next.toFixed(3)));
    };

    const start = async () => {
      if (!enabled) return;
      if (!svc.isSupported()) {
        setStatus('unsupported');
        return;
      }
      setStatus('connecting');
      setError(null);
      try {
        await svc.requestAndConnect(onReading);
        if (!mounted) return;
        setStatus('connected');
      } catch (e: any) {
        if (!mounted) return;
        setStatus('error');
        setError(e?.message || 'Failed to connect');
        setEnabled(false);
      }
    };

    const stop = async () => {
      try {
        await svc.disconnect();
      } catch {}
      if (!mounted) return;
      setStatus('idle');
      setWeight(null);
      smoothedRef.current = null;
    };

    if (enabled) start();
    else stop();

    return () => {
      mounted = false;
    };
  }, [enabled, svc]);

  const isConnected = useMemo(() => status === 'connected' && svc.connected, [status, svc]);

  return { enabled, setEnabled, status, isConnected, weight, error, isSupported: svc.isSupported() };
}
