import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { FontAwesome5 } from '@expo/vector-icons';

// Definición de la interfaz Book
interface Book {
    id: string;
    title: string;
    price: string;
    image: string;
}

export default function BookList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    // Categorías para los géneros
    const categories = [
        "Romance",
        "Sci-Fi",
        "Medieval",
        "Manga",
        "Comics",
        "Drama",
        "Terror",
        "Fantasía",
        "Aventura",
        "Histórico",
        "Educativo",
    ];

    useEffect(() => {
        // Configurar la referencia a la colección y escuchar cambios en tiempo real
        const q = query(collection(db, 'books'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBooks: Book[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title,
                price: doc.data().price,
                image: doc.data().image,
            }));
            setBooks(fetchedBooks);
            setLoading(false);
        });

        // Limpiar la suscripción al desmontar el componente
        return () => unsubscribe();
    }, []);

    const renderBook = ({ item }: { item: Book }) => (
        <View style={styles.bookCard}>
            <Image source={{ uri: item.image }} style={styles.bookImage} />
            <Text style={styles.bookTitle}>{item.title}</Text>
            <Text style={styles.bookPrice}>${item.price}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Buscar en libreríaVirtual"
                    style={styles.searchInput}
                />
                <FontAwesome5 name="search" size={20} color="black" style={styles.searchIcon} />
                <FontAwesome5 name="shopping-cart" size={20} color="black" style={styles.cartIcon} />
            </View>

            {/* Carrusel de categorías */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryCarousel}
            >
                {categories.map((category, index) => (
                    <TouchableOpacity key={index} style={styles.categoryCircle}>
                        <Text style={styles.categoryText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Lista de libros */}
            <Text style={styles.sectionTitle}>Para ti</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={books}
                    renderItem={renderBook}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.bookList}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 15,
    },
    cartIcon: {
        marginRight: 10,
    },
    categoryCarousel: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    categoryCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#dedede',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    categoryText: {
        fontSize: 10,
        textAlign: 'center',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    bookList: {
        paddingHorizontal: 10,
    },
    bookCard: {
        flex: 1,
        margin: 5,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
    },
    bookImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    bookTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        padding: 10,
        color: '#333',
    },
    bookPrice: {
        fontSize: 14,
        color: '#2a9d8f',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
});
