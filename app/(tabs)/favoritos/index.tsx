import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Favoritos() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Favoritos</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'blue',
    },
});
