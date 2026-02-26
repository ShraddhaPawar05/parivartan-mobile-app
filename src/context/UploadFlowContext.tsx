import React, { createContext, useContext, useState } from 'react';

type PickupAddress = {
  house: string;
  street: string;
  city: string;
  pincode: string;
  landmark?: string;
};

type UploadFlowState = {
  category?: string;
  setCategory: (c?: string) => void;
  quantity?: number;
  unit?: 'kg' | 'items';
  setQuantity: (q: number, unit?: 'kg'|'items') => void;
  pickupType?: 'pickup'|'dropoff';
  setPickupType: (p: 'pickup'|'dropoff') => void;
  selectedPartner?: { id: string; name: string } | null;
  setSelectedPartner: (p: { id: string; name: string } | null) => void;
  pickupAddress?: PickupAddress | null;
  setPickupAddress: (a: PickupAddress | null) => void;
  imageUrl?: string | null;
  setImageUrl: (url: string | null) => void;
  confidence?: number | null;
  setConfidence: (conf: number | null) => void;
};

const UploadFlowContext = createContext<UploadFlowState | undefined>(undefined);

export const UploadFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [category, setCategoryState] = useState<string | undefined>(undefined);
  const [quantity, setQuantityState] = useState<number | undefined>(undefined);
  const [unit, setUnitState] = useState<'kg' | 'items'>('kg');
  const [pickupType, setPickupTypeState] = useState<'pickup'|'dropoff'>('pickup');
  const [selectedPartner, setSelectedPartnerState] = useState<{ id: string; name: string } | null>(null);
  const [pickupAddress, setPickupAddressState] = useState<PickupAddress | null>(null);
  const [imageUrl, setImageUrlState] = useState<string | null>(null);
  const [confidence, setConfidenceState] = useState<number | null>(null);

  const setCategory = (c?: string) => setCategoryState(c);
  const setQuantity = (q: number, u: 'kg'|'items' = 'kg') => { setQuantityState(q); setUnitState(u); };
  const setPickupType = (p: 'pickup'|'dropoff') => setPickupTypeState(p);
  const setSelectedPartner = (p: { id: string; name: string } | null) => setSelectedPartnerState(p);
  const setPickupAddress = (a: PickupAddress | null) => setPickupAddressState(a);
  const setImageUrl = (url: string | null) => setImageUrlState(url);
  const setConfidence = (conf: number | null) => setConfidenceState(conf);

  return (
    <UploadFlowContext.Provider value={{ category, setCategory, quantity, setQuantity, unit, pickupType, setPickupType, selectedPartner, setSelectedPartner, pickupAddress, setPickupAddress, imageUrl, setImageUrl, confidence, setConfidence }}>
      {children}
    </UploadFlowContext.Provider>
  );
};

export function useUploadFlow() {
  const ctx = useContext(UploadFlowContext);
  if (!ctx) throw new Error('useUploadFlow must be used within UploadFlowProvider');
  return ctx;
}
