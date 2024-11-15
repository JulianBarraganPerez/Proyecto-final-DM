import { Stack } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Instagram</Text>
              <Link href="/(tabs)/home/message" asChild>
                <TouchableOpacity>
                  <Icon name="chatbubble-outline" size={24} style={{ marginLeft: 15 }} />
                </TouchableOpacity>
              </Link>
              <Link href="/(tabs)/home/notifications" asChild>
                <TouchableOpacity>
                  <Icon name="notifications-outline" size={24} style={{ marginLeft: 15 }} />
                </TouchableOpacity>
              </Link>
            </View>
          ),
        }}
      />
      <Stack.Screen name="notifications"
        options={{
          title: "Notificaciones",
        }}
      />
    </Stack>
  );
}


