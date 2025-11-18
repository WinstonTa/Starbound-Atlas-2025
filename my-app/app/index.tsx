// import { StyleSheet, Text, View } from 'react-native';
// import firestore from '@react-native-firebase/firestore';
// import { useEffect } from 'react';
//
//
// export default function HomeScreen() {
//   // return (
//   //   <View style={styles.container}>
//   //     <Text style={styles.text}>HappyMapper First Screen</Text>
//   //   </View>
//   // );
//
//   // debuggging firebase connection
//   useEffect(() => {
//     firestore().collection('deals').limit(1).get()
//       .then(() => console.log('Firestore OK'))
//       .catch(e => console.log('Firestore ERR', e));
//   }, []);
//   return <View styles={ styles.container }><Text>Home page, testing firebase connection, check logs</Text></View>;
// }
//
// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: '#020911ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     color: 'white',
//     fontSize: 24,
//     fontWeight: 'bold',
//   }
// });


// app/index.tsx TESTING FIREBASE CONNECTION, TESTING ZONE DANGER YAY
import React, { useEffect, useState, memo } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getAllVenuesWithDeals, type FrontendVenueWithDeals, type FrontendDeal } from '../src/venues';

function formatAddress(addr: FrontendVenueWithDeals['address']): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [
    // adapt to your object shape if you have one
    addr['city'], addr['state'], addr['street'], addr['zip'],
  ].filter(Boolean).map(String);
  return parts.length ? parts.join(', ') : JSON.stringify(addr);
}

const DealItem = memo(({ d }: { d: FrontendDeal }) => {
  const time = d.start_time && d.end_time ? `${d.start_time}–${d.end_time}` : '';
  const days = Array.isArray(d.days) && d.days.length ? d.days.join(', ') : '';
  return (
    <View style={{ paddingVertical: 6 }}>
      <Text style={{ fontWeight: '600' }}>
        {String(d.name ?? 'Unnamed deal')}{d.price != null ? ` · ${String(d.price)}` : ''}
      </Text>
      {!!(time || days) && <Text style={{ opacity: 0.8 }}>{time}{time && days ? ' · ' : ''}{days}</Text>}
      {!!d.description && <Text style={{ opacity: 0.9 }}>{String(d.description)}</Text>}
      {!!d.special_conditions && <Text style={{ opacity: 0.8 }}>Conditions: {String(d.special_conditions)}</Text>}
    </View>
  );
});

export default function Home() {
  const [venues, setVenues] = useState<FrontendVenueWithDeals[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await getAllVenuesWithDeals();
        setVenues(v);
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (err) return <Text style={{ margin: 16 }}>Error: {err}</Text>;

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={venues}
      keyExtractor={(x, i) => String(x.venue_id ?? i)}
      renderItem={({ item }) => {
        const addressText = formatAddress(item.address);
        const deals = Array.isArray(item.deals) ? item.deals : [];
        return (
          <View style={{ padding: 12, borderRadius: 8, backgroundColor: '#f2f2f2', marginBottom: 12 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {String(item.venue_name ?? 'Unnamed venue')}
            </Text>
            {!!addressText && <Text style={{ marginBottom: 6 }}>{addressText}</Text>}

            {deals.length === 0 ? (
              <Text style={{ opacity: 0.6 }}>No deals</Text>
            ) : (
              <View style={{ paddingTop: 4 }}>
                {deals.map((d, idx) => (
                  <DealItem key={`${item.venue_id}-deal-${idx}`} d={d} />
                ))}
              </View>
            )}
          </View>
        );
      }}
    />
  );
}

