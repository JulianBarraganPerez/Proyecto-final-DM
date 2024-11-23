import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db, auth } from "@/utils/firebaseConfig";
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface User {
  firstname: string;
  lastname: string;
}

interface Post {
  id: string;
  image: string;
  description: string;
  title: string;
  category: string;
  price: string;
  location: string;
  date: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user and posts on mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Fetch user data
  const fetchUserData = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      const userRef = doc(db, 'Users', userId);

      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setUser(docSnap.data() as User);
          fetchUserPosts(userId);
        } else {
          console.log('No existe el documento de usuario');
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
      }
    } else {
      console.log('No hay usuario autenticado');
    }
  };

  // Fetch posts created by the user
  const fetchUserPosts = async (userId: string) => {
    setLoading(true);
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);

      const userPosts: Post[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          image: data.image || '', // Fallback if image is missing
          description: data.description || 'Sin descripción',
          title: data.title || 'Sin título',
          category: data.category || 'Sin categoría',
          price: data.price || 'No disponible',
          location: data.address || 'Sin ubicación',
          date: data.date?.toDate().toLocaleDateString() || 'Fecha desconocida',
        };
      });

      setPosts(userPosts);
    } catch (error) {
      console.error('Error al recuperar publicaciones:', error);
    }
    setLoading(false);
  };

  // Refresh posts
  const handleRefreshPosts = async () => {
    if (auth.currentUser) {
      const userId = auth.currentUser.uid;
      fetchUserPosts(userId);
    }
  };

  // Render a single post
  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.category}>Categoría: {item.category}</Text>
      <Text style={styles.price}>Precio: {item.price}</Text>
      <Text style={styles.location}>Ubicación: {item.location}</Text>
      <Text style={styles.date}>Fecha: {item.date}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <View style={styles.userInfo}>
            <View style={styles.initialsContainer}>
              <Text style={styles.initials}>
                {user.firstname.charAt(0)}{user.lastname.charAt(0)}
              </Text>
            </View>
            <Text style={styles.username}>{`${user.firstname} ${user.lastname}`}</Text>
          </View>

          <TouchableOpacity onPress={handleRefreshPosts} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Recargar Posts</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              renderItem={renderPost}
              ListEmptyComponent={<Text>No hay posts aún</Text>}
            />
          )}
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
    padding: 16,
  },
  userInfo: {
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
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  category: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  price: {
    fontSize: 16,
  },
  location: {
    fontSize: 16,
  },
  date: {
    fontSize: 14,
    color: 'gray',
  },
  description: {
    marginTop: 8,
    fontSize: 16,
  },
});
