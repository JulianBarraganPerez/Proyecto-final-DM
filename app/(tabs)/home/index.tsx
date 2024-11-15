import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { db } from "@/utils/firebaseConfig";
import { collection, getDocs, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Post {
  id: string;
  image: string;
  description: string;
  userId: string;
  date: { seconds: number, nanoseconds: number };
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fetchAllPosts = async (order: 'desc' | 'asc') => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('date', order));
      const querySnapshot = await getDocs(q);

      const allPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        allPosts.push({ id: doc.id, ...doc.data() } as Post);
      });

      console.log('Todos los posts:', allPosts);
      setPosts(allPosts);
    } catch (error) {
      console.error('Error al obtener todos los posts:', error);
    }
  };

  const fetchPostsByDate = async (date: Date) => {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      const querySnapshot = await getDocs(q);
      const filteredPosts: Post[] = [];
      querySnapshot.forEach((doc) => {
        filteredPosts.push({ id: doc.id, ...doc.data() } as Post);
      });

      console.log('Posts filtrados por fecha:', filteredPosts);
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error al filtrar posts por fecha:', error);
    }
  };

  useEffect(() => {
    fetchAllPosts(sortOrder);
  }, [sortOrder]);

  const handlePressPost = (post: Post) => {
    router.push({
      pathname: "/(tabs)/home/postDetails/[id]",
      params: { id: post.id },
    });
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      fetchPostsByDate(date);
    }
  };

  const resetToAllPosts = () => {
    setSelectedDate(null);
    fetchAllPosts(sortOrder);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posts</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setSortOrder('desc')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Más recientes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSortOrder('asc')}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Más antiguos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Seleccionar fecha</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={resetToAllPosts}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Mostrar todos</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {posts.length === 0 ? (
        <Text>No hay posts disponibles</Text>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handlePressPost(item)}>
              <View style={styles.postContainer}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.description}>{item.description}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  postContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    padding: 8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  description: {
    marginTop: 8,
    fontSize: 16,
  },
});

