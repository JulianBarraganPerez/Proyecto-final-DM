import axios from 'axios';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';

// Define la estructura de un mensaje extendiendo IMessage
interface Message extends IMessage {
    user: {
        _id: number;
        name: string;
        avatar: string;
    };
}

const GeminisChat = () => {
    const [messages, setMessages] = useState<IMessage[]>([]);  // Usamos IMessage en lugar de Message
    const [loading, setLoading] = useState(false);

    // Tu API Key de Gemini
    const API_KEY = 'AIzaSyAUu6rmY5p8U3CYj7q6Yiq4sDTOga6gIn8';

    // Función para obtener respuestas de la API de Gemini
    const handleSend = async (newMessages: IMessage[] = []) => {
        setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

        const userMessage = newMessages[0].text;
        setLoading(true);

        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`,
                {
                    contents: [{
                        parts: [{
                            text: userMessage
                        }]
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Acceder al contenido de la respuesta de Gemini
            const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

            // Verificar que se obtuvo un texto válido
            let botMessageText = 'Lo siento, no pude entender la pregunta.';
            if (content) {
                botMessageText = content;
            }

            // Respuesta del bot
            const botMessage: IMessage = {
                _id: Math.round(Math.random() * 1000000),  // Usamos número aquí, porque IMessage permite string o number
                text: botMessageText,
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Asistente Geminis',
                    avatar: 'https://example.com/avatar.png', // Avatar del bot (si tienes uno)
                },
            };

            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [botMessage])
            );
        } catch (error) {
            console.error('Error al obtener respuesta:', error);
            const botMessage: IMessage = {
                _id: Math.round(Math.random() * 1000000), // Usamos número aquí también
                text: 'Hubo un error al procesar tu solicitud.',
                createdAt: new Date(),
                user: {
                    _id: 2,
                    name: 'Asistente Geminis',
                    avatar: 'https://example.com/avatar.png',
                },
            };
            setMessages((previousMessages) =>
                GiftedChat.append(previousMessages, [botMessage])
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} // Usamos undefined en lugar de null
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <GiftedChat
                    messages={messages}
                    onSend={(newMessages) => handleSend(newMessages)}
                    user={{
                        _id: 1, // El ID del usuario que escribe
                    }}
                    isLoadingEarlier={loading}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
});

export default GeminisChat;



