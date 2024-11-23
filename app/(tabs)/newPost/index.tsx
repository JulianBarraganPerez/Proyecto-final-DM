import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, Alert } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, { useContext, useEffect, useState } from 'react';
import { Button, TextInput } from 'react-native-paper';
import ModalCamera from '@/components/ModalCamera';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { DataContext } from '@/dataContext/DataContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '@/utils/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function NewBookPost() {
    const { newPost } = useContext(DataContext);
    const [isVisible, setIsVisible] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<{ uri: string } | undefined>(undefined);
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [locationText, setLocationText] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    const categories = [
        "Romance",
        "Sci-Fi",
        "Medieval",
        "Manga",
        "Comics",
        "Drama",
        "Terror",
        "Fantasia",
        "Aventura",
        "Histórico",
        "Educativo",
    ];

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        })();
    }, []);

    const getAddress = async () => {
        if (location == null) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
            );
            const data = await response.json();
            setLocationText(data.display_name);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSavePost = async () => {
        if (currentPhoto) {
            try {
                const storage = getStorage();
                const storageRef = ref(storage, `images/${currentPhoto.uri.split('/').pop()}`);
                const response = await fetch(currentPhoto.uri);
                const blob = await response.blob();

                await uploadBytes(storageRef, blob);
                const downloadURL = await getDownloadURL(storageRef);

                await addDoc(collection(db, "books"), {
                    userId: auth.currentUser?.uid,
                    title,
                    category,
                    price,
                    address: locationText,
                    description,
                    image: downloadURL,
                    date: new Date()
                });

                // Mostrar alerta de éxito
                Alert.alert('Éxito', 'El libro se ha publicado correctamente.');

                // Reiniciar los campos del formulario
                setCurrentPhoto(undefined);
                setTitle('');
                setCategory('');
                setPrice('');
                setDescription('');
                setLocationText('');

            } catch (error) {
                console.error('Error al guardar el libro:', error);
                Alert.alert('Error', 'Hubo un problema al publicar el libro. Inténtalo de nuevo.');
            }
        } else {
            Alert.alert('Advertencia', 'Por favor, sube una foto antes de publicar el libro.');
        }
    };

    return (
        <ScrollView
            style={{
                flex: 1,
                paddingHorizontal: 20,
                paddingVertical: 10,
            }}
            contentContainerStyle={{
                gap: 25
            }}
        >
            <TouchableOpacity onPress={() => setIsVisible(true)}>
                {currentPhoto && currentPhoto.uri ? (
                    <Image
                        style={{
                            width: '100%',
                            height: 200
                        }}
                        source={{ uri: currentPhoto.uri }}
                        contentFit="cover"
                    />
                ) : (
                    <View
                        style={{
                            backgroundColor: 'grey',
                            paddingHorizontal: 20,
                            aspectRatio: 1 / 0.8,
                            borderRadius: 10,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <FontAwesome5 name="camera" size={30} color="white" />
                    </View>
                )}
            </TouchableOpacity>

            <TextInput
                label="Título"
                mode="outlined"
                onChangeText={text => setTitle(text)}
                value={title}
                style={{ borderRadius: 10 }}
            />

            <TouchableOpacity
                onPress={() => setCategoryModalVisible(true)}
                style={{
                    borderColor: 'grey',
                    borderWidth: 1,
                    padding: 15,
                    borderRadius: 10,
                }}
            >
                <Text>{category || "Seleccionar categoría"}</Text>
            </TouchableOpacity>

            <Modal
                visible={categoryModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: 'white',
                            padding: 20,
                            borderRadius: 10,
                            width: '80%',
                        }}
                    >
                        <FlatList
                            data={categories}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setCategory(item);
                                        setCategoryModalVisible(false);
                                    }}
                                    style={{
                                        padding: 10,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#ccc',
                                    }}
                                >
                                    <Text>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button onPress={() => setCategoryModalVisible(false)}>
                            Cerrar
                        </Button>
                    </View>
                </View>
            </Modal>

            <TextInput
                label="Precio"
                mode="outlined"
                keyboardType="numeric"
                onChangeText={text => setPrice(text)}
                value={price}
                style={{ borderRadius: 10 }}
            />

            <TextInput
                label="Descripción"
                mode="outlined"
                multiline
                onChangeText={text => setDescription(text)}
                value={description}
                numberOfLines={3}
                style={{ borderRadius: 10 }}
            />

            <TouchableOpacity onPress={getAddress} style={{ marginVertical: 10 }}>
                <Text>{locationText ? locationText : "Obtener ubicación"}</Text>
            </TouchableOpacity>

            <Button
                icon="camera"
                mode="contained"
                onPress={() => setIsVisible(true)}
                style={{ borderRadius: 10 }}
            >
                Tomar foto
            </Button>

            <Button
                icon="check"
                mode="contained"
                onPress={handleSavePost}
                style={{ borderRadius: 10 }}
            >
                Publicar libro
            </Button>

            <ModalCamera
                isVisible={isVisible}
                onClose={() => setIsVisible(false)}
                onSave={(photo) => {
                    setCurrentPhoto(photo);
                    setIsVisible(false);
                }}
            />
        </ScrollView>
    );
}
