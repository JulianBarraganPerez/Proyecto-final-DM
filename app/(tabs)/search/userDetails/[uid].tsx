import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from "@/utils/firebaseConfig";

interface User {
  firstname: string;
  lastname: string;
  email: string;
}

export default function UserDetails() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserDetails(id as string);
    }
  }, [id]);

  const fetchUserDetails = async (userId: string) => {
    const userRef = doc(db, 'Users', userId);

    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUser(docSnap.data() as User);
      } else {
        console.log('No existe el documento de usuario');
      }
    } catch (error) {
      console.error('Error al cargar detalles del usuario:', error);
    }
  };

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.initialsContainer}>
            <Text style={styles.initials}>
              {user.firstname.charAt(0)}{user.lastname.charAt(0)}
            </Text>
          </View>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{`${user.firstname} ${user.lastname}`}</Text>
          <Text style={styles.label}>Correo electrónico:</Text>
          <Text style={styles.value}>{user.email}</Text>
        </>
      ) : (
        <Text>Cargando...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center', 
    marginBottom: 20, 
  },
  initials: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    marginBottom: 10,
  },
});
