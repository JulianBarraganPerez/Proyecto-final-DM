import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import React, { useState, useContext } from 'react';
import { Link } from 'expo-router';
import { AuthContext } from '@/context/AuthContext';

export default function Signup() {
    const { signUp } = useContext(AuthContext); // Usamos el contexto para acceder a la función de registro

    const [email, setEmail] = useState(''); // Estado para el correo electrónico
    const [password, setPassword] = useState(''); // Estado para la contraseña
    const [firstname, setFirstname] = useState(''); // Estado para el nombre
    const [lastname, setLastname] = useState(''); // Estado para el apellido

    const handleSignUp = async () => {
        if (!firstname || !lastname) {
            Alert.alert('Error', 'Por favor ingresa tu nombre y apellido.');
            return;
        }

        const success = await signUp(firstname, lastname, email, password); // Llama a la función de registro con nombre y apellido
        if (success) {
            Alert.alert('Registro exitoso', '¡Bienvenido!', [
                { text: 'OK', onPress: () => console.log('User registered') },
            ]);
        } else {
            Alert.alert('Error', 'No se pudo registrar. Por favor verifica tus datos.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Registro</Text>
            
            <TextInput
                placeholder="Nombre"
                value={firstname}
                onChangeText={setFirstname} // Actualiza el estado del nombre
                style={styles.input}
            />
            
            <TextInput
                placeholder="Apellido"
                value={lastname}
                onChangeText={setLastname} // Actualiza el estado del apellido
                style={styles.input}
            />
            
            <TextInput
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail} // Actualiza el estado del correo
                style={styles.input}
            />
            
            <TextInput
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword} // Actualiza el estado de la contraseña
                secureTextEntry // Oculta la contraseña
                style={styles.input}
            />
            
            <Button
                title='Registrar'
                onPress={handleSignUp} // Llama a la función de registro
            />
            
            <Link href={"/(tabs)/home"} asChild>
                <Button title='Ir a Inicio' />
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center'
    },
    title: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 20 
    },
    input: {
        padding: 10,
        paddingHorizontal: 20,
        margin: 10,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        width: '80%' 
    }
});
