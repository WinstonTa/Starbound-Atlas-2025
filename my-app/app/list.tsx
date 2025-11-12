import { ScrollView, StyleSheet, View } from 'react-native';
import data from '../assets/data/fake_venues.json';
import ListBox from "../components/ListBox";

export default function ListScreen() {
  return (

    <ScrollView>
      <View style={styles.container}>
        <View style={styles.listContainer}>
          {/*mapping json file info into boxes*/}
          {data.map((venue) => (
            <ListBox
              venue_name={venue.venue_name}
              address={venue.address}
              deal={venue.deals}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F4EAE1',
  },

  listContainer: {
    marginTop: 40,
    margin: 20,
  }
});
