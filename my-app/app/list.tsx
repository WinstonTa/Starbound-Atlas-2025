// app/list.tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { watchAllVenuesWithDeals, type FrontendVenueWithDeals } from '../src/get_venues';
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
  
  // probe automatically on start, UNCOMMENT if you need to debug connectivity with firebase
  // useEffect(() => {
  //   probe();
  // }, []);


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
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.headerText}>HappyMapper</Text>
      </View>
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.listContainer}>
            {venues.map((venue, index) => (
              <ListBox key={String(venue.venue_id ?? index)} venue={venue} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#F5EBE0' },
  header: {
    backgroundColor: '#F5EBE0',
    paddingTop: 50,
    paddingBottom: 15,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#E8886B',
    letterSpacing: 1,
  },
  container: { flex: 1, alignItems: 'center', backgroundColor: '#F4EAE1' },
  listContainer: { marginTop: 40, margin: 20 },
});

