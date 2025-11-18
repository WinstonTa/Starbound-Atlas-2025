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


// app/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { getAllVenuesWithDeals } from '../src/venues';

type Venue = {
  venue_id: string;
  venue_name: any;
  latitude?: number;
  longitude?: number;
  address?: any;           // can be string or object
  deals?: any[];
};

type Deal = {
  name: string;
  price: string | number;
  description?: string | null;
  start_time?: string;
  end_time?: string;
  days?: string[];
  special_conditions?: string | null;
};

function formatAddress(addr: any): string {
  if (addr == null) return '';
  if (typeof addr === 'string') return addr;
  // common shapes
  if (typeof addr === 'object') {
    if (addr.formatted) return String(addr.formatted);
    const parts = [addr.street, addr.city, addr.state, addr.postalCode]
      .filter(Boolean)
      .map(String);
    if (parts.length) return parts.join(', ');
    return JSON.stringify(addr); // last resort
  }
  return String(addr);
}

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await getAllVenuesWithDeals();
        setVenues(v as Venue[]);
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
      keyExtractor={(x) => String(x.venue_id ?? Math.random())}
      renderItem={({ item }) => {
        const addressText = formatAddress(item.address);
        const dealsCount = Array.isArray(item.deals) ? item.deals.length : 0;
        return (
          <View style={{ padding: 12, borderRadius: 8, backgroundColor: '#f2f2f2', marginBottom: 10 }}>
            <Text style={{ fontWeight: 'bold' }}>{String(item.venue_name ?? 'Unnamed venue')}</Text>
            {!!addressText && <Text>{addressText}</Text>}
            <Text>{dealsCount} deals</Text>
          </View>
        );
      }}
    />
  );
}





