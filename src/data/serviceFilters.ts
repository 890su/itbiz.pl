export const serviceFilterIds = [
  'incidents',
  'lan',
  'wifi',
  'office',
  'monitoring',
] as const;

export type ServiceFilterId = (typeof serviceFilterIds)[number];

const serviceFilters: Record<string, readonly ServiceFilterId[]> = {
  'network-emergency': ['incidents', 'lan', 'wifi'],
  'lan-outlet-repair': ['incidents', 'lan'],
  'small-office-wifi-audit': ['wifi'],
  'rack-cabinet-cleanup': ['lan', 'office'],
  'office-it-move': ['office'],
  'cctv-emergency': ['incidents', 'monitoring', 'lan'],
  'cctv-cabling': ['monitoring', 'lan'],
  'meeting-room-display': ['office'],
  'managed-it': ['office'],
  'lan-installation': ['lan'],
  'office-wifi': ['wifi'],
  'network-repair': ['incidents', 'lan', 'wifi'],
};

export function getServiceFilters(serviceId: string): readonly ServiceFilterId[] {
  return serviceFilters[serviceId] ?? [];
}
