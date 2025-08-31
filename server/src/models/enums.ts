export enum OrderType{
    PICKUP = 'PICKUP',
    DELIVERY = 'DELIVERY'
}

export enum SpicyLevel {
  NO_SPICY = 'no_spicy',
  SPICY = 'spicy',
  VERY_SPICY = 'very_spicy',
}
const SPICY_LEVELS = [
  { label: 'No Spicy', value: SpicyLevel.NO_SPICY },
  { label: 'Spicy', value: SpicyLevel.SPICY },
  { label: 'Very Spicy', value: SpicyLevel.VERY_SPICY },
];