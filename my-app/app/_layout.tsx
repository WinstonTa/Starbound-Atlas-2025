import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
        },
        tabBarLabelStyle: {
          color: 'black',
        },
      }}>
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarLabel: 'List',
        }}
      />
      <Tabs.Screen
        name="upload-menu"
        options={{
          title: 'Upload Deal',
          tabBarLabel: 'Upload',
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="add_deal"
        options={{
          href: null, // This hides the tab
        }}
      />
      <Tabs.Screen
        name="MainScreen"
        options={{
          href: null, // This hides the tab
        }}
      />
       <Tabs.Screen
        name="login"
        options={{
          href: null, // This hides the tab
        }}
      />

    </Tabs>
  );
}
