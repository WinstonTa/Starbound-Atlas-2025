// src/api/venues.ts
import firestore from '@react-native-firebase/firestore';

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
  latitude: number | null;
  longitude: number | null;
  address: string | Record<string, unknown> | null;
  deals: FrontendDeal[];
};

// ---- helpers ----
function toVenue(doc: FirebaseFirestoreTypes.DocumentSnapshot): FrontendVenueWithDeals {
  const v = (doc.data() as any) ?? {};
  const deals: FrontendDeal[] = Array.isArray(v.deals)
    ? v.deals.map((d: any) => ({
        name: d?.name ?? '',
        price: d?.price ?? '',
        description: d?.description ?? null,
        start_time: d?.start_time ?? '',
        end_time: d?.end_time ?? '',
        days: Array.isArray(d?.days) ? d.days : [],
        special_conditions:
          Array.isArray(d?.special_conditions)
            ? d.special_conditions.join('; ')
            : (d?.special_conditions ?? null),
      }))
    : [];

  return {
    venue_id: v.venue_id ?? doc.id,
    venue_name: v.venue_name ?? '',
    latitude: v.latitude ?? null,
    longitude: v.longitude ?? null,
    address: v.address ?? null,
    deals,
  };
}

// ---- one-shot fetch ----
export async function getAllVenuesWithDeals(): Promise<FrontendVenueWithDeals[]> {
  const snap = await firestore().collection('final_schema').get();
  return snap.docs.map(toVenue);
}

// ---- realtime subscription (optional) ----
export function watchAllVenuesWithDeals(onChange, onError) {
  return firestore()
    .collection('final_schema')
    .onSnapshot(
      (snap) => {
        console.log('final_schema size:', snap.size);
        onChange(snap.docs.map(toVenue));
      },
      (err) => {
        console.log('final_schema error:', err);
        onError?.(err);
      }
    );
}


