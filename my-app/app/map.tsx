import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

// Minimal local type
type Venue = {
  venue_id: string;
  venue_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | Record<string, any> | null;
  image_url?: string | null;
  deals?: any[];
};

export default function MapScreen() {
  const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const geocodeCache = useRef<Record<string, { latitude: number; longitude: number }>>({});
  const unsubRef = useRef<() => void | null>(null);

  // request user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // load venues from firebase (dynamic import) with fallback to local JSON
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('../src/get_venues'); // dynamic to avoid top-level native import crash in Expo Go
        if (!mounted) return;
        if (mod.watchAllVenuesWithDeals) {
          unsubRef.current = mod.watchAllVenuesWithDeals(
            (v: Venue[]) => {
              setVenues(v);
            },
            (err: any) => {
              console.warn('watch venues error', err);
            }
          );
        } else {
          // if only one-shot exists, call it
          const v = await mod.getAllVenuesWithDeals();
          if (mounted) setVenues(v);
        }
      } catch (e) {
        console.log('Could not load native get_venues (likely Expo Go). Falling back to local data.', e);
        try {
          const local = await import('../assets/data/venues.json');
          if (mounted) setVenues(local?.default ?? local);
        } catch (e2) {
          console.warn('Failed to load local venues.json', e2);
        }
      }
    })();
    return () => {
      mounted = false;
      if (unsubRef.current) {
        try {
          unsubRef.current();
        } catch {}
        unsubRef.current = null;
      }
    };
  }, []);

  // Try geocoding addresses for venues that lack coords (one-time per venue_id)
  useEffect(() => {
    const toGeocode = venues.filter(v => (!v.latitude || !v.longitude) && v.address && !geocodeCache.current[v.venue_id]);
    if (toGeocode.length === 0) return;

    (async () => {
      for (const v of toGeocode) {
        let addrStr = '';
        if (typeof v.address === 'string') {
          addrStr = v.address;
        } else if (v.address && typeof v.address === 'object') {
          const { street, city, state, postalCode, country } = v.address as any;
          addrStr = [street, city, state, postalCode, country].filter(Boolean).join(', ');
        }
        if (!addrStr) continue;
        try {
          // caution: geocoding many items can be rate-limited; prefer precomputed coords in DB
          const results = await Location.geocodeAsync(addrStr);
          if (results && results[0]) {
            geocodeCache.current[v.venue_id] = { latitude: results[0].latitude, longitude: results[0].longitude };
            // trigger re-render
            setVenues(prev => prev.map(x => (x.venue_id === v.venue_id ? { ...x } : x)));
          }
        } catch (e) {
          console.warn('Geocode failed for', v.venue_id, addrStr, e);
        }
      }
    })();
  }, [venues]);

  function formatAddress(a?: string | Record<string, any> | null) {
    if (!a) return '';
    if (typeof a === 'string') return a;
    const { street, city, state, postalCode, country } = a as any;
    return [street, city, state, postalCode, country].filter(Boolean).join(', ');
  }

  if (!region) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      region={region}
      showsUserLocation={true}
      followsUserLocation={true}
      showsMyLocationButton={true}
    >
      <Marker coordinate={region} title="You Are Here" />
      {venues.map(v => {
        const cached = geocodeCache.current[v.venue_id];
        const lat = v.latitude ?? cached?.latitude;
        const lng = v.longitude ?? cached?.longitude;
        if (lat == null || lng == null) return null;
        return (
          <Marker
            key={v.venue_id}
            coordinate={{ latitude: lat, longitude: lng }}
            title={v.venue_name ?? 'Venue'}
            description={formatAddress(v.address)}
          />
        );
      })}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e71212ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: { flex: 1 },
});