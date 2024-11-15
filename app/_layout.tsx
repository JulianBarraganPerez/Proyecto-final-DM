import { Stack } from "expo-router";
import "../utils/firebaseConfig";
import { AuthProvider } from "@/context/AuthContext";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {

  /// -> -> -> -> -> ->   - Stack1
  //             -> ->  - Stack2
  //             -> ->  - Stack3
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false
          }}
          initialRouteName="signin"
        >
          <Stack.Screen name="index" options={{ title: 'Ingresa' }} />
          {/* <Stack.Screen name="signin" options={{ title: 'Ingresa' }} /> */}
          <Stack.Screen name="signup" options={{ title: 'Registrate' }} />
          {/* Cuando el usuario se loggea */}
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
