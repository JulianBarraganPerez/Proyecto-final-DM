import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{
          title: "Instagram",
        }}
      />
      <Stack.Screen 
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Stack.Screen 
        name="settings"
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen 
        name="editProfile"
        options={{
          title: "Edit Profile",
        }}
      />
    </Stack>
  );
}
