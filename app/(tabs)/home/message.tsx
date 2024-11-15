import { View, Text, TextInput, Button, FlatList, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig'; 

type MessageType = {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  createdAt: { toDate: () => Date };
};

type UserType = {
  id: string;
  firstname: string;
  lastname: string;
};

export default function Message() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user] = useState(auth.currentUser); 
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'Users'); 
      const querySnapshot = await getDocs(usersRef);
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as UserType[];
      setUsers(userList);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user || !selectedRecipient) return;

    const unsubscribe = openListener(selectedRecipient);
    return () => unsubscribe && unsubscribe();
  }, [user, selectedRecipient]);

  const openListener = (recipientId: string) => {
    const messagesRef = collection(db, 'messages');

    const q = query(
      messagesRef,
      where('senderId', 'in', [user?.uid, recipientId]),
      where('recipientId', 'in', [user?.uid, recipientId]),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MessageType[];
      setMessages(newMessages);
    }, (error) => {
      console.error('Error al recibir mensajes:', error);
    });

    return unsubscribe;
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !selectedRecipient) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderId: user?.uid,
        recipientId: selectedRecipient,
        createdAt: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  };

  const renderMessage = ({ item }: { item: MessageType }) => (
    <View style={{ padding: 10, backgroundColor: item.senderId === user?.uid ? '#DCF8C6' : '#FFF', marginVertical: 5, borderRadius: 10 }}>
      <Text>{item.text}</Text>
      <Text style={{ fontSize: 10, color: '#999', textAlign: 'right' }}>{item.createdAt.toDate().toLocaleString()}</Text>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {/* Selector de usuario */}
      <Picker
        selectedValue={selectedRecipient}
        onValueChange={(itemValue: string | null) => setSelectedRecipient(itemValue)}
        style={{ marginBottom: 20 }}
      >
        <Picker.Item label="Seleccione un usuario" value={null} />
        {users.map(user => (
          <Picker.Item key={user.id} label={`${user.firstname} ${user.lastname}`} value={user.id} />
        ))}
      </Picker>

      {/* Lista de mensajes */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Entrada para nuevo mensaje */}
      {selectedRecipient && (
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Escribe un mensaje..."
            style={{ flex: 1, borderColor: '#ccc', borderWidth: 1, borderRadius: 5, padding: 10 }}
          />
          <Button title="Enviar" onPress={handleSendMessage} />
        </View>
      )}
    </View>
  );
}

