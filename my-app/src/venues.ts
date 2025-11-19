// src/api/venues.ts
// Note: This file is currently not used by the upload-menu feature
// The upload-menu uses the Flask backend API directly

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
  address: string | Record<string, unknown> | null;
  deals: FrontendDeal[];
};

// This function would need Firebase Functions setup to work
// Currently using Flask backend API instead
export async function getAllVenuesWithDeals(): Promise<FrontendVenueWithDeals[]> {
  throw new Error('This feature requires Firebase Functions setup. Use the Flask API instead.');
}

