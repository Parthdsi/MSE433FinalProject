import type { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
  {
    name: 'Peak Rush',
    description: 'Morning/evening rush hour (high demand)',
    params: {
      walkInArrivalRate: 30,
      mobileArrivalRate: 22,
    },
  },
  {
    name: 'Moderate',
    description: 'Mid-day steady traffic',
    params: {
      walkInArrivalRate: 18,
      mobileArrivalRate: 13,
    },
  },
  {
    name: 'Off-Peak',
    description: 'Quiet afternoon period',
    params: {
      walkInArrivalRate: 10,
      mobileArrivalRate: 7,
    },
  },
];
