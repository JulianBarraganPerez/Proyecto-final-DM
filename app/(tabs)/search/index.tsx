import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { db } from "@/utils/firebaseConfig";
import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';

interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
}

export default function Search() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'Users');
      const querySnapshot = await getDocs(usersRef);

      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({ id: doc.id, ...doc.data() } as User);
      });

      console.log('Usuarios:', fetchedUsers);
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const handlePressUser = (userId: string) => {
    router.push({
      params: { id: userId },
      // @ts-ignore
      pathname:"/(tabs)/search/userDetails/[uid]"
    });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePressUser(item.id)}>
            <View style={styles.userContainer}>
              <View style={styles.initialsContainer}>
                <Text style={styles.initials}>
                  {item.firstname.charAt(0)}{item.lastname.charAt(0)}
                </Text>
              </View>
              <Text style={styles.username}>{`${item.firstname} ${item.lastname}`}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No hay usuarios registrados</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  initialsContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  initials: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 18,
  },
});
