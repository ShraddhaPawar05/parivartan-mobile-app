export const wasteIconMap: Record<string, string> = {
  Plastic: 'bottle-soda',
  plastic: 'bottle-soda',
  Paper: 'newspaper-variant',
  paper: 'newspaper-variant',
  Metal: 'cog',
  metal: 'cog',
  Clothes: 'tshirt-crew',
  clothes: 'tshirt-crew',
  'E-waste': 'cellphone',
  'e-waste': 'cellphone',
  Organic: 'food-apple',
  organic: 'food-apple',
};

export const wasteColorMap: Record<string, { bg: string; icon: string }> = {
  Plastic: { bg: '#f0f9ff', icon: '#0ea5e9' },
  plastic: { bg: '#f0f9ff', icon: '#0ea5e9' },
  Paper: { bg: '#fef9f3', icon: '#f97316' },
  paper: { bg: '#fef9f3', icon: '#f97316' },
  Metal: { bg: '#f5f3ff', icon: '#8b5cf6' },
  metal: { bg: '#f5f3ff', icon: '#8b5cf6' },
  Clothes: { bg: '#fdf4ff', icon: '#d946ef' },
  clothes: { bg: '#fdf4ff', icon: '#d946ef' },
  'E-waste': { bg: '#fef3f2', icon: '#ef4444' },
  'e-waste': { bg: '#fef3f2', icon: '#ef4444' },
  Organic: { bg: '#f0fdf4', icon: '#10b981' },
  organic: { bg: '#f0fdf4', icon: '#10b981' },
};

export function getWasteIcon(category?: string) {
  if (!category) return 'recycle';
  return wasteIconMap[category] ?? 'recycle';
}

export function getWasteColor(category?: string) {
  if (!category) return { bg: '#f9fafb', icon: '#6b7280' };
  return wasteColorMap[category] ?? { bg: '#f9fafb', icon: '#6b7280' };
}
