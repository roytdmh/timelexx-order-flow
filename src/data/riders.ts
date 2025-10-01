
export const RIDERS = [
  { id: 'Rider 001', name: 'Sabolia' },
  { id: 'Rider 002', name: 'Awaga' },
  { id: 'Rider 003', name: 'Joe Lee' }
];

export const getRiderDisplayName = (riderId: string): string => {
  const rider = RIDERS.find(r => r.id === riderId);
  return rider ? rider.name : riderId;
};
