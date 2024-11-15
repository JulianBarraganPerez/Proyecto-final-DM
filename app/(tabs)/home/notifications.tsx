import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { onSnapshot, collection, doc, updateDoc, query, where } from "firebase/firestore";
import { db, auth } from "@/utils/firebaseConfig";

interface Message {
  id: string;
  senderName: string;
  text: string;
  seen: boolean;
}

export default function NotificationsScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos denegados', 'Se necesitan permisos de notificaciones para recibir alertas.');
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token); 
    })();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'chats'), where('seen', '==', false));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({ ...doc.data(), id: doc.id } as Message);
      });
      setMessages(newMessages);
      setLoading(false);

      newMessages.forEach((message) => {
        sendLocalNotification(message.senderName, message.text);
      });
    });

    return () => unsubscribe();
  }, []);

  const sendLocalNotification = async (senderName: string, messageText: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Nuevo mensaje de ${senderName}`,
        body: messageText,
      },
      trigger: null, 
    });
  };

  const markAsSeen = async (messageId: string) => {
    const messageRef = doc(db, 'chats', messageId);
    await updateDoc(messageRef, {
      seen: true,
    });

    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}
    >
      {loading ? (
        <Text>Cargando notificaciones...</Text>
      ) : messages.length > 0 ? (
        <ScrollView>
          {messages.map((message) => (
            <TouchableOpacity
              key={message.id}
              onPress={() => markAsSeen(message.id)}
              style={{
                padding: 15,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: 'bold' }}>{message.senderName}</Text>
              <Text>{message.text}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text>No has recibido nuevos mensajes.</Text>
      )}
    </View>
  );
}
