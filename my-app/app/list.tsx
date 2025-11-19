import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getAllVenuesWithDeals, type FrontendVenueWithDeals } from '../src/venues';
import ListBox from '../components/ListBox';

export default function ListScreen() {
  const [venues, setVenues] = useState<FrontendVenueWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await getAllVenuesWithDeals();
        setVenues(Array.isArray(v) ? v : []);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }
  if (err) {
    return <Text style={{ margin: 16 }}>Error: {err}</Text>;
  }

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
    fontWeight: '300',
    color: '#E8886B',
    letterSpacing: 1,
  },
  container: { flex: 1, alignItems: 'center', backgroundColor: '#F4EAE1' },
  listContainer: { marginTop: 40, margin: 20 },
});

