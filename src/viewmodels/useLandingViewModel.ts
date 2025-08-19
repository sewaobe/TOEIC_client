import { benefits } from '../models/Benefit';
import { features } from '../models/Feature';

export const useLandingViewModel = () => {
  return {
    benefits,
    features,
  };
};
