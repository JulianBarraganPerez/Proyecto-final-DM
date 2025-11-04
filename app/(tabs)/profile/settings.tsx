// Settings.js
import React, { useEffect, useState } from "react";
import MapView, { Marker, Circle } from "react-native-maps";
import { StyleSheet, View, Text } from "react-native";
import * as Location from "expo-location";

export default function Settings() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("el permiso para acceder a tu ubicacion fue denegado por tu dispositivo");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setMarkerCoordinate({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Establecer un intervalo para actualizar la ubicación cada 5 segundos
      const interval = setInterval(async () => {
        const newLocation = await Location.getCurrentPositionAsync({});
        setLocation(newLocation);
      }, 5000); 

      return () => clearInterval(interval); 
    })();
  }, []);

  const handleMarkerDragEnd = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerCoordinate({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          style={styles.map}
          region={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        >
          <Marker
            coordinate={markerCoordinate}
            title="Ubicación actual"
            draggable
            onDragEnd={handleMarkerDragEnd} 
          />
          <Circle
            center={{
              latitude: markerCoordinate.latitude,
              longitude: markerCoordinate.longitude,
            }}
            radius={100}
            strokeColor="rgba(0, 112, 255, 0.5)"
            fillColor="rgba(0, 112, 255, 0.2)"
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Cargando mapa...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
