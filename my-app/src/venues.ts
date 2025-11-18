// src/api/venues.ts
import { getApp } from '@react-native-firebase/app';
import {
  getFunctions,
  httpsCallable,
} from '@react-native-firebase/functions';

export type FrontendDeal = {
  name: string;
  price: string | number;
  description?: string | null;
  start_time: string;
  end_time: string;
  days: string[];
  special_conditions?: string | null;
};

export type FrontendVenueWithDeals = {
  venue_id: string;
  venue_name: string;
  latitude: number;
  longitude: number;
  address: string;
  deals: FrontendDeal[];
};

// ✅ initialize modular API with region
const app = getApp();
const fns = getFunctions(app, 'us-central1'); // adjust if backend uses a different region

export async function getAllVenuesWithDeals() {
  const callable = httpsCallable(fns, 'getAllVenuesWithDeals');
  const res = await callable({});

  if (!res.data?.success) {
    throw new Error(res.data?.error || 'Function returned unsuccessful');
  }

  return res.data.venues as FrontendVenueWithDeals[];
}

