import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import React, { useContext, useEffect, useState } from 'react';
import { Button, TextInput } from 'react-native-paper';
import ModalCamera from '@/components/ModalCamera';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { DataContext } from '@/dataContext/DataContext';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth } from '@/utils/firebaseConfig'; // Asegúrate de importar auth
import { collection, addDoc } from 'firebase/firestore';

export default function NewPost() {
    const { newPost } = useContext(DataContext);
    const [isVisible, setIsVisible] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<{ uri: string } | undefined>(undefined);
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [locationText, setLocationText] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

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
            console.log (`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`)
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`);
            const data = await response.json();
            setLocationText(data.display_name);
        } catch (error) {
            console.log(error);
        }
    };

    const handleSavePost = async () => {
        if (currentPhoto) {
            // Crea una referencia en Firebase Storage
            const storage = getStorage();
            const storageRef = ref(storage, `images/${currentPhoto.uri.split('/').pop()}`);
            const response = await fetch(currentPhoto.uri);
            const blob = await response.blob();

            // Sube la imagen a Firebase Storage
            await uploadBytes(storageRef, blob).then((snapshot) => {
                console.log('Uploaded a blob or file!');
            });

            // Obtén la URL de descarga
            const downloadURL = await getDownloadURL(storageRef);

            // Guarda el post en Firestore
            await addDoc(collection(db, "posts"), {
                userId: auth.currentUser?.uid, // Guarda el userId
                address: locationText,
                description,
                image: downloadURL,
                date: new Date()
            });

            console.log('Post guardado en Firestore:', {
                userId: auth.currentUser?.uid, 
                address: locationText,
                description,
                image: downloadURL,
                date: new Date()
            });
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
            <TouchableOpacity
                onPress={() => setIsVisible(true)}
            >
                {currentPhoto && currentPhoto.uri ? (
                    <Image
                        style={{
                            width: '100%',
                            height: 200 // Ajusta la altura según sea necesario
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
                            alignContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <FontAwesome5 name="camera" size={30} color="white" />
                    </View>
                )}
            </TouchableOpacity>

            <TextInput
                label="Descripción"
                mode="outlined"
                multiline
                onChangeText={text => setDescription(text)}
                value={description}
                numberOfLines={3}
                style={{
                    borderRadius: 10
                }}
            />

            <TouchableOpacity onPress={getAddress} style={{ marginVertical: 10 }}>
                <Text>{locationText ? locationText : "Obtener ubicación"}</Text>
            </TouchableOpacity>

            <Button
                icon="camera"
                mode="contained"
                onPress={() => setIsVisible(true)}
                style={{
                    borderRadius: 10
                }}
            >
                Tomar foto
            </Button>

            <Button
                icon="check"
                mode="contained"
                onPress={handleSavePost}
                style={{
                    borderRadius: 10
                }}
            >
                Guardar Post
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
