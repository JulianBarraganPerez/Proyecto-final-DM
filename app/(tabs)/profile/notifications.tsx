import { auth, db } from "@/utils/firebaseConfig"; // Ajusta la importación según tu estructura
import * as Notifications from 'expo-notifications';
import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";

interface Notification {
  id: string;
  type: "message";
  content: string;
  timestamp: Date;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser; // Usuario actual autenticado

  useEffect(() => {
    if (!user) {
      Alert.alert("Error", "No se pudo verificar al usuario actual.");
      return;
    }

    // Llamar a la función para verificar los mensajes en los últimos 20 minutos
    checkRecentMessages(user.uid);

    // Configurar el listener para mensajes nuevos
    const unsubscribe = listenForMessages(user.uid);

    return () => unsubscribe();
  }, [user]);

  const checkRecentMessages = async (userId: string) => {
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000); // Calcula la fecha de hace 20 minutos
    const messagesRef = collection(db, "chats");
    const q = query(
      messagesRef,
      where("recipientId", "==", userId), // Mensajes dirigidos al usuario
      where("createdAt", ">", twentyMinutesAgo) // Mensajes de los últimos 20 minutos
    );

    // Consulta los mensajes en los últimos 20 minutos
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const message = doc.data();
        sendNotification(message);
      });
    }
  };

  const sendNotification = async (message: any) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Nuevo mensaje",
          body: `${message.senderName} te envió un mensaje: "${message.text}"`,
        },
        trigger: null, // Enviar la notificación inmediatamente
      });
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  };

  const listenForMessages = (userId: string) => {
    const messagesRef = collection(db, "chats");
    const q = query(
      messagesRef,
      where("recipientId", "==", userId), // Verifica mensajes dirigidos al usuario actual
      where("seen", "==", false) // Solo mensajes no vistos
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          type: "message",
          content: `${doc.data().senderName} te envió un mensaje: "${doc.data().text}"`,
          timestamp: new Date(doc.data().createdAt?.seconds * 1000 || Date.now()),
        })) as Notification[];

        setNotifications((prev) => [...prev, ...newNotifications]);
        setLoading(false);
      },
      (error) => {
        console.error("Error al recibir mensajes:", error);
      }
    );
  };

  const handleClearNotifications = () => {
    setNotifications([]); // Borra notificaciones localmente
    Alert.alert("Notificaciones eliminadas", "Se han borrado todas las notificaciones.");
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {loading ? (
        <Text>Cargando notificaciones...</Text>
      ) : notifications.length > 0 ? (
        <ScrollView>
          {notifications.map((notif) => (
            <View
              key={notif.id}
              style={{
                padding: 15,
                backgroundColor: "#E8F5E9",
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Mensaje recibido</Text>
              <Text>{notif.content}</Text>
              <Text style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
                {notif.timestamp.toLocaleString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text>No hay notificaciones pendientes.</Text>
      )}
      <Button title="Borrar todas las notificaciones" onPress={handleClearNotifications} />
    </View>
  );
}



