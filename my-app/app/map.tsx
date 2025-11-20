import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, TextInput, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Minimal local types
type Deal = {
  name?: string;
  description?: string | null;
  days?: string[];
  start_time?: string;
  end_time?: string;
};

type Venue = {
  venue_id: string;
  venue_name?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | Record<string, any> | null;
  image_url?: string | null;
  deals?: Deal[];
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const [region, setRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [query, setQuery] = useState('');
  const geocodeCache = useRef<Record<string, { latitude: number; longitude: number }>>({});
  const unsubRef = useRef<() => void | null>(null);
  const mapRef = useRef<any>(null);

  // user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const r = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(r);
    })();
  }, []);

  // load venues (dynamic import to avoid native crash in Expo Go)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('../src/get_venues');
        if (!mounted) return;
        if (mod.watchAllVenuesWithDeals) {
          unsubRef.current = mod.watchAllVenuesWithDeals(
            (v: Venue[]) => setVenues(v),
            (err: any) => console.warn('watch venues error', err)
          );
        } else {
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
        try { unsubRef.current(); } catch {}
        unsubRef.current = null;
      }
    };
  }, []);

  // geocode addresses for venues missing coords (one-time cached)
  useEffect(() => {
    const toGeocode = venues.filter(v => (!v.latitude || !v.longitude) && v.address && !geocodeCache.current[v.venue_id]);
    if (toGeocode.length === 0) return;
    (async () => {
      for (const v of toGeocode) {
        let addrStr = '';
        if (typeof v.address === 'string') addrStr = v.address;
        else if (v.address && typeof v.address === 'object') {
          const { street, city, state, postalCode, country } = v.address as any;
          addrStr = [street, city, state, postalCode, country].filter(Boolean).join(', ');
        }
        if (!addrStr) continue;
        try {
          const results = await Location.geocodeAsync(addrStr);
          if (results && results[0]) {
            geocodeCache.current[v.venue_id] = { latitude: results[0].latitude, longitude: results[0].longitude };
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

  function formatFirstDeal(d?: Deal[] | null) {
    if (!d || d.length === 0) return null;
    const first = d[0];
    const name = first.name ?? '';
    const description = first.description ?? '';
    const days = Array.isArray(first.days) ? first.days.join(', ') : '';
    const times = (first.start_time ? first.start_time : '') + (first.end_time ? ` - ${first.end_time}` : '');
    const parts = [name, description, days, times].filter(Boolean);
    return parts.join('\n');
  }

  async function handleSearchSubmit() {
    const q = query.trim();
    if (!q) return;

    const qLower = q.toLowerCase();
    const matches = venues.filter(v => {
      const addr = formatAddress(v.address).toLowerCase();
      const name = (v.venue_name ?? '').toLowerCase();
      return name.includes(qLower) || addr.includes(qLower);
    });

    if (matches.length > 0) {
      // choose first match with coords or attempt to geocode its address
      let chosen = matches.find(m => (m.latitude != null && m.longitude != null) || geocodeCache.current[m.venue_id]);
      if (!chosen) {
        const m = matches[0];
        const addrStr = formatAddress(m.address);
        if (addrStr) {
          try {
            const res = await Location.geocodeAsync(addrStr);
            if (res && res[0]) {
              geocodeCache.current[m.venue_id] = { latitude: res[0].latitude, longitude: res[0].longitude };
              chosen = m;
            }
          } catch (e) {
            console.warn('Geocode during search failed', e);
          }
        }
      }
      if (chosen) {
        const lat = chosen.latitude ?? geocodeCache.current[chosen.venue_id]?.latitude;
        const lng = chosen.longitude ?? geocodeCache.current[chosen.venue_id]?.longitude;
        if (lat != null && lng != null) {
          const r = { latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 };
          setRegion(r);
          try { mapRef.current?.animateToRegion(r, 500); } catch {}
        }
      }
      return;
    }

    // No venue matched: try geocoding the query itself (e.g., "Long Beach")
    try {
      const res = await Location.geocodeAsync(q);
      if (res && res[0]) {
        const r = { latitude: res[0].latitude, longitude: res[0].longitude, latitudeDelta: 0.08, longitudeDelta: 0.08 };
        setRegion(r);
        try { mapRef.current?.animateToRegion(r, 500); } catch {}
      } else {
        console.log('No geocode result for query:', q);
      }
    } catch (e) {
      console.warn('Geocode failed for query', q, e);
    }
  }

  if (!region) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
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

          const addressText = formatAddress(v.address);
          const dealText = formatFirstDeal(v.deals);
          const calloutText = [addressText, dealText].filter(Boolean).join('\n\n');

          return (
            <Marker
              key={v.venue_id}
              coordinate={{ latitude: lat, longitude: lng }}
              title={v.venue_name ?? 'Venue'}
            >
              <Callout tooltip={false}>
                <View style={{ maxWidth: 260, padding: 8 }}>
                  <Text style={{ fontWeight: '700', marginBottom: 4 }}>{v.venue_name ?? 'Venue'}</Text>
                  <Text>{calloutText || 'No address or deal info available'}</Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Search bar overlay */}
      <View
        style={[styles.searchContainer, { top: insets.top + 12 }]}
        onStartShouldSetResponder={() => true}
      >
        <TextInput
          placeholder="Search city, venue, or address (e.g. Long Beach)"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          style={styles.searchInput}
          clearButtonMode="while-editing"
          accessible={true}
          importantForAutofill="yes"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit} accessibilityLabel="Search">
          <Text style={{ color: '#fff', fontWeight: '700' }}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  searchContainer: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    elevation: 10,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#E8886B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
});