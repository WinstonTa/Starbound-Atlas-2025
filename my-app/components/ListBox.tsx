import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';

export default function ListBox({ venue_name, address, deal }) {
  const { height, width } = useWindowDimensions();
  const cardHeight = Math.round(height * 0.15); // 16% of screen height

  const tf = deal.time_frame?.[0];
  const d0 = deal.deals?.[0];

  return (
    <View style={[styles.card, { height: cardHeight, width: width - 24 }]}>
      <Image source={{ uri: 'https://picsum.photos/80' }} style={styles.thumb} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{venue_name}</Text>
        <Text style={styles.addr} numberOfLines={1}>
          {address.street}, {address.city}, {address.state} {address.zip}
        </Text>
        <Text style={styles.time} numberOfLines={1}>
          {tf?.start_time} – {tf?.end_time}
        </Text>
        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
          {d0?.name}{d0?.description ? ` — ${d0.description}` : ''}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  thumb: { width: 100, height: 100, borderRadius: 8, marginRight: 10 }, // image
  content: { flex: 1, justifyContent: 'center' }, // card content
  title: { fontSize: 16, fontWeight: '700' }, // title
  addr: { fontSize: 12, color: '#666', marginTop: 2 }, // address
  time: { fontSize: 13, fontWeight: '600', marginTop: 4 }, // deal time
  desc: { fontSize: 13, marginTop: 4, flexShrink: 1 }, // deal description
});

