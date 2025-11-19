import { Tabs, usePathname } from 'expo-router';
import { Text as RNText } from 'react-native';

export default function TabLayout() {
  const pathname = usePathname();
  const isIndexScreen = pathname === '/' || pathname === '/index';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8D5C4',
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
          display: isIndexScreen ? 'none' : 'flex',
        },
        tabBarActiveTintColor: '#E8886B',
        tabBarInactiveTintColor: '#A67B5B',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
          tabBarIcon: () => <RNText style={{ fontSize: 22 }}>📍</RNText>,
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Favorites',
          tabBarLabel: 'Favorites',
          tabBarIcon: () => <RNText style={{ fontSize: 22 }}>⭐</RNText>,
        }}
      />
      <Tabs.Screen
        name="upload-menu"
        options={{
          title: 'Add Deal',
          tabBarLabel: 'Add Deal',
          tabBarIcon: ({ focused }) => (
            <RNText style={{
              fontSize: focused ? 28 : 24,
              backgroundColor: '#E8886B',
              borderRadius: 25,
              width: 50,
              height: 50,
              textAlign: 'center',
              lineHeight: 50,
              marginTop: -20,
            }}>
              📷
            </RNText>
          ),
        }}
      />
      <Tabs.Screen
        name="add_deal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add_deal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="splash"
        options={{
          href: null,
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
