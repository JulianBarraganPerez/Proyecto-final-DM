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
    Modal,
    Button,
    Alert,
} from 'react-native';
import { 
    collection, 
    onSnapshot, 
    query, 
    orderBy, 
    doc, 
    updateDoc, 
    getDoc, 
    setDoc 
} from 'firebase/firestore';
import { db, auth } from '@/utils/firebaseConfig';
import { FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Book {
    id: string;
    title: string;
    price: string;
    image: string;
    address: string;
    bookState: string;
    category: string;
    date: string;
    description: string;
    likedBy: string[];
    quantity?: number; // Cantidad para el carrito
}

export default function BookList() {
    const [books, setBooks] = useState<Book[]>([]);
    const [filteredBooks, setFilteredBooks] = useState<Book[]>([]); // Libros filtrados por categoría
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [cart, setCart] = useState<Book[]>([]);
    const [quantity, setQuantity] = useState(1); // Nueva cantidad seleccionada

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
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUserId(currentUser.uid);
            loadCart(currentUser.uid);
        }

        const q = query(collection(db, 'books'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedBooks: Book[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                title: doc.data().title,
                price: doc.data().price,
                image: doc.data().image,
                address: doc.data().address,
                bookState: doc.data().bookState,
                category: doc.data().category,
                date: doc.data().date.toDate().toString(),
                description: doc.data().description,
                likedBy: doc.data().likedBy || [],
            }));
            setBooks(fetchedBooks);
            setFilteredBooks(fetchedBooks); // Inicializar la lista filtrada
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Filtrar libros por categoría
        if (selectedCategory) {
            setFilteredBooks(books.filter((book) => book.category === selectedCategory));
        } else {
            setFilteredBooks(books);
        }
    }, [selectedCategory, books]);

    const loadCart = async (uid: string) => {
        const cartRef = doc(db, 'carts', uid);
        const cartDoc = await getDoc(cartRef);

        if (cartDoc.exists()) {
            setCart(cartDoc.data().items || []);
        }
    };

    const saveCart = async (uid: string, updatedCart: Book[]) => {
        const cartRef = doc(db, 'carts', uid);
        await setDoc(cartRef, { items: updatedCart });
    };

    const addToCart = (book: Book, quantity: number) => {
        if (!userId) {
            Alert.alert('Error', 'Por favor inicia sesión para añadir libros al carrito.');
            return;
        }

        const existingBookIndex = cart.findIndex((item) => item.id === book.id);

        let updatedCart;

        if (existingBookIndex !== -1) {
            updatedCart = cart.map((item, index) =>
                index === existingBookIndex
                    ? { ...item, quantity: (item.quantity || 0) + quantity }
                    : item
            );
        } else {
            updatedCart = [...cart, { ...book, quantity }];
        }

        setCart(updatedCart);
        saveCart(userId, updatedCart);
        Alert.alert('Éxito', `Se añadieron ${quantity} unidades de "${book.title}" al carrito.`);
    };

    const toggleLike = async (book: Book) => {
        if (!userId) {
            Alert.alert('Error', 'Por favor inicia sesión para dar "me gusta".');
            return;
        }

        const isLiked = book.likedBy.includes(userId);
        const updatedLikedBy = isLiked
            ? book.likedBy.filter((id) => id !== userId)
            : [...book.likedBy, userId];

        await updateDoc(doc(db, 'books', book.id), { likedBy: updatedLikedBy });
    };

    const openModal = (book: Book) => {
        setSelectedBook(book);
        setQuantity(1);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setSelectedBook(null);
        setIsModalVisible(false);
    };

    const renderBook = ({ item }: { item: Book }) => {
        const isLiked = item.likedBy.includes(userId || '');

        return (
            <View style={styles.bookCard}>
                <TouchableOpacity onPress={() => openModal(item)}>
                    <Image source={{ uri: item.image }} style={styles.bookImage} />
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookPrice}>${item.price}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.favoriteIcon}
                    onPress={() => toggleLike(item)}
                >
                    <FontAwesome
                        name="heart"
                        size={24}
                        color={isLiked ? 'red' : 'gray'}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Buscar en libreríaVirtual"
                    style={styles.searchInput}
                />
                <FontAwesome5 name="search" size={20} color="black" style={styles.searchIcon} />
                <Link href="/home/carrito">
    <FontAwesome5 name="shopping-cart" size={20} color="black" style={styles.cartIcon} />
</Link>


            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryCarousel}
            >
                {categories.map((category, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.categoryCircle,
                            selectedCategory === category && styles.categoryCircleSelected,
                        ]}
                        onPress={() =>
                            setSelectedCategory(selectedCategory === category ? null : category)
                        }
                    >
                        <Text style={styles.categoryText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>
                {selectedCategory ? `Categoría: ${selectedCategory}` : "Para ti"}
            </Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <FlatList
                    data={filteredBooks}
                    renderItem={renderBook}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.bookList}
                />
            )}

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedBook && (
                            <>
                                <Image source={{ uri: selectedBook.image }} style={styles.modalImage} />
                                <Text style={styles.modalTitle}>{selectedBook.title}</Text>
                                <Text style={styles.modalPrice}>${selectedBook.price}</Text>
                                <Text style={styles.modalDescription}>{selectedBook.description}</Text>

                                {/* Selector de cantidad */}
                                <View style={styles.quantitySelector}>
                                    <TouchableOpacity
                                        onPress={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Text style={styles.quantityButton}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{quantity}</Text>
                                    <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                        <Text style={styles.quantityButton}>+</Text>
                                    </TouchableOpacity>
                                </View>

                                <Button
                                    title="Agregar al carrito"
                                    onPress={() => {
                                        addToCart(selectedBook, quantity);
                                        closeModal();
                                    }}
                                />
                                <Button title="Cerrar" onPress={closeModal} />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
  categoryCircleSelected: {
      backgroundColor: '#2a9d8f',
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
  modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
      backgroundColor: '#fff',
      padding: 20,
      borderRadius: 10,
      width: '80%',
      alignItems: 'center',
  },
  modalImage: {
      width: '100%',
      height: 200,
      resizeMode: 'cover',
      marginBottom: 10,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  modalPrice: {
      fontSize: 18,
      color: '#2a9d8f',
      marginBottom: 10,
  },
  modalDescription: {
      fontSize: 14,
      color: '#333',
      marginBottom: 10,
      textAlign: 'center',
  },
  quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
  },
  quantityButton: {
      fontSize: 24,
      color: '#2a9d8f',
      paddingHorizontal: 10,
      paddingVertical: 5,
  },
  quantityText: {
      fontSize: 18,
      color: '#333',
      paddingHorizontal: 10,
  },
  favoriteIcon: {
      position: 'absolute',
      top: 10,
      right: 10,
  },
  cartButton: {
      position: 'absolute',
      bottom: 10,
      right: 10,
      backgroundColor: '#f4f4f4',
      borderRadius: 20,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
  },
});
