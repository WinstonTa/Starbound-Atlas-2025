// app/list.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { watchAllVenuesWithDeals, type FrontendVenueWithDeals } from '../src/venues';
import ListBox from '../components/ListBox';

export default function ListScreen() {
  const [venues, setVenues] = useState<FrontendVenueWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

useEffect(() => {
  const unsub = watchAllVenuesWithDeals(
    (v) => {
      setVenues(v);
      setLoading(false);
    },
    (e) => {
      setErr(e?.code ? `${e.code}: ${e.message}` : String(e));
      setLoading(false);          // turn off loading
    }
  );
  return unsub;
}, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (err) return <Text style={{ margin: 16 }}>Error: {err}</Text>;

  return (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={venues}
      keyExtractor={(x, i) => String(x.venue_id ?? i)}
      renderItem={({ item }) => <ListBox venue={item} />}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 20, backgroundColor: '#F4EAE1' },
});

