import React, { createContext, useContext, useEffect, useState } from 'react';

// Optional AsyncStorage import (will fail gracefully if not installed)
let AsyncStorage: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

export type RequestStatus = 'Submitted' | 'Accepted' | 'In Progress' | 'Completed' | 'Rejected' | 'Pending';

export type Request = {
  id: string;
  category: string;
  quantity: number;
  unit: 'kg' | 'items';
  pickupType: 'pickup' | 'dropoff';
  pickupAddress?: { house: string; street: string; city: string; pincode: string; landmark?: string };
  selectedPartner?: { id: string; name: string } | null;
  status: RequestStatus;
  createdAt: string;
  timeline: { status: RequestStatus; at: string }[];
};

type RedeemedReward = { id: string; title: string; cost: number; redeemedAt: string };

// Points calculation helper - exported so UI can estimate expected points
export const calculatePointsForRequest = (r: { category: string; quantity: number; unit: 'kg' | 'items' }) => {
  // base points per unit/kg by waste category
  const perKg: Record<string, number> = {
    Plastic: 12,
    Cloth: 8,
    Metal: 14,
    Glass: 9,
    'E-Waste': 25,
    Paper: 6,
  };
  const perItem: Record<string, number> = {
    Plastic: 6,
    Cloth: 4,
    Metal: 10,
    Glass: 5,
    'E-Waste': 12,
    Paper: 3,
  };
  const qty = Math.max(1, Math.round(r.quantity));
  if (r.unit === 'items') return qty * (perItem[r.category] ?? 5);
  return qty * (perKg[r.category] ?? 10);
};

type RequestsContextType = {
  requests: Request[];
  addRequest: (r: Omit<Request, 'id' | 'status' | 'createdAt' | 'timeline'>) => string;
  getRequestById: (id: string) => Request | undefined;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  advanceRequestStatus: (id: string) => void;
  points: number;
  creditPoints: (n: number) => void;
  redeemed: RedeemedReward[];
  redeemReward: (title: string, cost: number) => boolean;
};

const RequestsContext = createContext<RequestsContextType | undefined>(undefined);

const seed: Request[] = [];

export const RequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Request[]>(seed);
  const [points, setPoints] = useState<number>(0);
  const [redeemed, setRedeemed] = useState<RedeemedReward[]>([]);

  // Load saved requests, points and redeemed rewards from AsyncStorage if available
  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem('@parivartan:requests');
        if (raw) setRequests(JSON.parse(raw));
        const pRaw = await AsyncStorage.getItem('@parivartan:points');
        if (pRaw) setPoints(Number(pRaw));
        const rRaw = await AsyncStorage.getItem('@parivartan:redeemed');
        if (rRaw) setRedeemed(JSON.parse(rRaw));
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Persist requests on change
  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem('@parivartan:requests', JSON.stringify(requests));
      } catch (e) {
        // ignore
      }
    })();
  }, [requests]);

  // Persist points on change
  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem('@parivartan:points', String(points));
      } catch (e) {
        // ignore
      }
    })();
  }, [points]);

  // Persist redeemed history on change
  useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        await AsyncStorage.setItem('@parivartan:redeemed', JSON.stringify(redeemed));
      } catch (e) {
        // ignore
      }
    })();
  }, [redeemed]);

  const addRequest = (r: Omit<Request, 'id' | 'status' | 'createdAt' | 'timeline'>) => {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    const newReq: Request = {
      id,
      ...r,
      status: 'Submitted',
      createdAt,
      timeline: [{ status: 'Submitted', at: createdAt }],
    };
    setRequests(prev => [newReq, ...prev]);
    return id;
  };

  const getRequestById = (id: string) => requests.find(r => r.id === id);

  const updateRequestStatus = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => {
      if (r.id !== id) return r;
      const at = new Date().toISOString();
      return { ...r, status, timeline: [...r.timeline, { status, at }] };
    }));
  };

  const advanceRequestStatus = (id: string) => {
    const order: RequestStatus[] = ['Submitted', 'Accepted', 'In Progress', 'Completed'];
    setRequests(prev => {
      let creditAmount = 0;
      const updated = prev.map(r => {
        if (r.id !== id) return r;
        const idx = order.indexOf(r.status);
        const next = idx < 0 ? 'Submitted' : (idx < order.length - 1 ? order[idx + 1] : order[order.length - 1]);
        const at = new Date().toISOString();
        // Only credit when transitioning into Completed AND the request is a pickup
        if (r.status !== 'Completed' && next === 'Completed' && r.pickupType === 'pickup') {
          creditAmount = calculatePointsForRequest(r);
        }
        return { ...r, status: next, timeline: [...r.timeline, { status: next, at }] };
      });
      if (creditAmount > 0) setPoints(p => p + creditAmount);
      return updated;
    });
  };

  const creditPoints = (n: number) => setPoints(p => p + n);

  const redeemReward = (title: string, cost: number) => {
    if (points < cost) return false;
    const id = Date.now().toString();
    const redeemedAt = new Date().toISOString();
    setPoints(p => p - cost);
    setRedeemed(prev => [{ id, title, cost, redeemedAt }, ...prev]);
    return true;
  };

  return <RequestsContext.Provider value={{ requests, addRequest, getRequestById, updateRequestStatus, advanceRequestStatus, points, creditPoints, redeemed, redeemReward }}>{children}</RequestsContext.Provider>;
};

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within RequestsProvider');
  return ctx;
}
