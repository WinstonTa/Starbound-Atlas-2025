import { memo, useState } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import type { FrontendVenueWithDeals, FrontendDeal } from '../src/get_venues';

type Props = { venue: FrontendVenueWithDeals };

function formatAddr(addr: FrontendVenueWithDeals['address']): string {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  const parts = [addr['street'], addr['city'], addr['state'], addr['zip']]
    .filter(Boolean)
    .map(String);
  return parts.join(', ');
}

function pickPrimaryDeal(deals?: FrontendDeal[]): { start?: string; end?: string; title?: string; desc?: string } {
  if (!Array.isArray(deals) || deals.length === 0) return {};
  const d = deals[0];
  return {
    start: d.start_time ? String(d.start_time) : undefined,
    end: d.end_time ? String(d.end_time) : undefined,
    title: d.name ? String(d.name) : undefined,
    desc: d.description ? String(d.description) : undefined,
  };
}

const ListBox = memo(({ venue }: Props) => {
  const { height, width } = useWindowDimensions();
  const cardHeight = Math.round(height * 0.15);
  const [modalVisible, setModalVisible] = useState(false);

  const addr = formatAddr(venue.address);
  const { start, end, title, desc } = pickPrimaryDeal(venue.deals);

  // Use uploaded image if available, otherwise use placeholder
  const imageSource = venue.image_url
    ? { uri: venue.image_url }
    : { uri: 'https://via.placeholder.com/100x100/E8886B/FFFFFF?text=No+Image' };

  return (
    <>
      <View style={[styles.card, { height: cardHeight, width: width - 24 }]}>
        <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
          <Image source={imageSource} style={styles.thumb} />
        </TouchableOpacity>
        <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {String(venue.venue_name ?? 'Unnamed venue')}
        </Text>

        {!!addr && (
          <Text style={styles.addr} numberOfLines={1}>
            {addr}
          </Text>
        )}

        {!!(start && end) && (
          <Text style={styles.time} numberOfLines={1}>
            {start} - {end}
          </Text>
        )}

        <Text style={styles.desc} numberOfLines={2} ellipsizeMode="tail">
          {title ?? 'No deals'}
          {desc ? ` - ${desc}` : ''}
        </Text>
      </View>
      </View>

      {/* Full-screen image modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={imageSource}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
});

export default ListBox;

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
  thumb: { width: 100, height: 100, borderRadius: 8, marginRight: 10 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700' },
  addr: { fontSize: 12, color: '#666', marginTop: 2 },
  time: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  desc: { fontSize: 13, marginTop: 4, flexShrink: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#E8886B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

