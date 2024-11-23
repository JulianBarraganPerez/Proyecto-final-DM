import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Definición de la interfaz del libro
interface Book {
    id: string;
    title: string;
    price: string;
    image: string;
    description: string;
    category: string;
}

export default function Cart() {
    const [cart, setCart] = useState<Book[]>([]);

    const handleCheckout = () => {
        Alert.alert('Gracias por tu compra', 'Tu pedido ha sido procesado.');
        setCart([]);
    };

    const renderCartItem = ({ item }: { item: Book }) => (
        <View style={styles.cartItem}>
            <Text style={styles.cartTitle}>{item.title}</Text>
            <Text style={styles.cartPrice}>${item.price}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Carrito de compras</Text>
            {cart.length > 0 ? (
                <FlatList
                    data={cart}
                    renderItem={renderCartItem}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <Text style={styles.emptyMessage}>Tu carrito está vacío.</Text>
            )}

            {cart.length > 0 && (
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutText}>Finalizar compra</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    cartItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    cartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartPrice: {
        fontSize: 16,
        color: '#2a9d8f',
    },
    emptyMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
        color: '#555',
    },
    checkoutButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#2a9d8f',
        borderRadius: 10,
        alignItems: 'center',
    },
    checkoutText: {
        color: '#fff',
        fontSize: 18,
    },
});
