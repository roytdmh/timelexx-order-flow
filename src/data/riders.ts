export const RIDERS = [
  { id: 'Rider1', name: 'Rider1' }
];

export const getRiderDisplayName = (riderId: string): string => {
  const rider = RIDERS.find(r => r.id === riderId);
  return rider ? rider.name : riderId;
};
