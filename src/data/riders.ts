
export const RIDERS = [
  { id: 'Rider 001', name: 'Asante' },
  { id: 'Rider 002', name: 'Savior' }
];

export const getRiderDisplayName = (riderId: string): string => {
  const rider = RIDERS.find(r => r.id === riderId);
  return rider ? rider.name : riderId;
};
