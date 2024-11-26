import { AuthProvider } from "@/context/AuthContext";
import { StripeProvider } from "@stripe/stripe-react-native"; // Importa StripeProvider
import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import "../utils/firebaseConfig";

export default function RootLayout() {
  return (

  <StripeProvider publishableKey="pk_test_51QP4kTRrvVMMNnMfhqm7p0ZNVn8nNFIHeMVJGoGOetbn42v2Yf3YfVfAXjneDBF22GRpkXDZefmL9LZepG9vCsls00SxI4GuX9">
      <PaperProvider>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" options={{ title: "Ingresa" }} />
            <Stack.Screen name="signup" options={{ title: "Regístrate" }} />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthProvider>
      </PaperProvider>
    </StripeProvider>
  );
}
