export const wasteIconMap: Record<string, string> = {
  Plastic: 'bottle-soda',
  Paper: 'file-document-outline',
  Metal: 'cog-outline',
  Clothes: 'tshirt-crew-outline',
  'E-waste': 'cellphone',
  Organic: 'leaf',
};

export function getWasteIcon(category?: string) {
  if (!category) return 'recycle';
  return wasteIconMap[category] ?? 'recycle';
}
