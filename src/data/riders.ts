
export const RIDERS = [
  { id: 'Sabolia', name: 'Sabolia' },
  { id: 'Awaga', name: 'Awaga' },
  { id: 'Joe Lee', name: 'Joe Lee' }
];

export const getRiderDisplayName = (riderId: string): string => {
  const rider = RIDERS.find(r => r.id === riderId);
  return rider ? rider.name : riderId;
};
