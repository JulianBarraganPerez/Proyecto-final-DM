import { View, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { db } from "@/utils/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';
import { useLocalSearchParams } from 'expo-router';

interface Post {
  userId: string;
  address: string;
  description: string;
  date: { seconds: number, nanoseconds: number };
}

interface User {
  firstname: string;
  lastname: string;
  email: string;
}

export default function PostDetails() {
  const { id } = useLocalSearchParams(); 

  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        if (id) {
          const postRef = doc(db, 'posts', id as string); 
          const postDoc = await getDoc(postRef);

          if (postDoc.exists()) {
            const postData = postDoc.data();
            setPost(postData as Post);

            // Fetch user details
            const userRef = doc(db, 'Users', postData.userId);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              setUser(userDoc.data() as User);
            } else {
              console.log('No se encontró el usuario');
            }
          } else {
            console.log('No se encontró el post');
          }
        }
      } catch (error) {
        console.error('Error al obtener los detalles del post:', error);
      }
    };

    fetchPostDetails();
  }, [id]);

  const formatDate = (timestamp: { seconds: number, nanoseconds: number }) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return "Fecha no disponible";
    }
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Detalles del Post</Text>
      {post && user ? (
        <>
          <Text style={styles.detailText}>
            Creado por: {`${user.firstname} ${user.lastname}`}
          </Text>
          <Text style={styles.detailText}>
            Correo: {user.email || "Correo no disponible"}
          </Text>
          <Text style={styles.detailText}>
            Dirección: {post.address || "Dirección no disponible"}
          </Text>
          <Text style={styles.detailText}>
            Descripción: {post.description || "Descripción no disponible"}
          </Text>
          <Text style={styles.detailText}>
            Fecha de publicación: {formatDate(post.date)}
          </Text>
        </>
      ) : (
        <Text>Cargando datos del post...</Text>
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
  detailText: {
    fontSize: 18,
    marginBottom: 10,
  },
});

