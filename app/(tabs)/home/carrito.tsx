import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { FontAwesome } from '@expo/vector-icons';

interface Book {
    id: string;
    title: string;
    price: string;
    image: string;
}

export default function CartView() {
    const [cartItems, setCartItems] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const userId = auth.currentUser?.uid;

    useEffect(() => {
        if (userId) {
            loadCart(userId);
        } else {
            Alert.alert('Error', 'Por favor inicia sesión para ver tu carrito.');
        }
    }, [userId]);

    const loadCart = async (uid: string) => {
        try {
            const cartRef = doc(db, 'carts', uid);
            const cartDoc = await getDoc(cartRef);

            if (cartDoc.exists()) {
                const data = cartDoc.data();
                setCartItems(data.items || []);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el carrito.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeFromCart = async (bookId: string) => {
        if (!userId) return;

        const updatedCart = cartItems.filter((item) => item.id !== bookId);
        setCartItems(updatedCart);

        try {
            const cartRef = doc(db, 'carts', userId);
            await updateDoc(cartRef, { items: updatedCart });
            Alert.alert('Éxito', 'Libro eliminado del carrito.');
        } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el libro del carrito.');
            console.error(error);
        }
    };

    const renderCartItem = ({ item }: { item: Book }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.cartItemImage} />
            <View style={styles.cartItemDetails}>
                <Text style={styles.cartItemTitle}>{item.title}</Text>
                <Text style={styles.cartItemPrice}>${item.price}</Text>
            </View>
            <TouchableOpacity
                onPress={() => removeFromCart(item.id)}
                style={styles.removeButton}
            >
                <FontAwesome name="trash" size={24} color="#ff6347" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tu carrito</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : cartItems.length === 0 ? (
                <Text style={styles.emptyCartText}>Tu carrito está vacío.</Text>
            ) : (
                <FlatList
                    data={cartItems}
                    renderItem={renderCartItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.cartList}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        padding: 10,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    cartList: {
        paddingBottom: 20,
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
        padding: 10,
    },
    cartItemImage: {
        width: 60,
        height: 60,
        borderRadius: 5,
        marginRight: 10,
    },
    cartItemDetails: {
        flex: 1,
    },
    cartItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartItemPrice: {
        fontSize: 14,
        color: '#2a9d8f',
        marginTop: 5,
    },
    removeButton: {
        padding: 5,
    },
    emptyCartText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
    },
});
