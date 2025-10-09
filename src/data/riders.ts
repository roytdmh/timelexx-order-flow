
export const RIDERS = [
  { id: 'Saboli', name: 'Saboli' },
  { id: 'Mensa', name: 'Mensa' },
  { id: 'Kwame', name: 'Kwame' }
];

export const getRiderDisplayName = (riderId: string): string => {
  const rider = RIDERS.find(r => r.id === riderId);
  return rider ? rider.name : riderId;
};
