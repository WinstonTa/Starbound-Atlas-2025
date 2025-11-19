// app/list.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { watchAllVenuesWithDeals, type FrontendVenueWithDeals } from '../src/venues';
import { probeFinalSchema } from '../src/health';
import ListBox from '../components/ListBox';

export default function ListScreen() {
  const [venues, setVenues] = useState<FrontendVenueWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);


  // test connectivity with firebase
  async function probe() {
    const res = await probeFinalSchema();
    if (res.ok) {
      Alert.alert('Firestore OK', `Query succeeded. Count: ${res.count}`);
    } else {
      Alert.alert('Firestore Error', `${res.code ?? 'unknown'}\n${res.reason ?? ''}`);
    }
  }
  
  // probe automatically on start
  useEffect(() => {
    probe();
  }, []);


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
  listContainer: { backgroundColor: '#F4EAE1' },
});

