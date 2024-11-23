import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { DataProvider } from '@/dataContext/DataContext';

export default function _layout() {
    return (
        <DataProvider>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "blue",
                    headerShown: false
                }}
            >
                <Tabs.Screen
                    name='home'
                    options={{
                        title: "Inicio",
                        tabBarIcon: ({ color, size }) => (<FontAwesome5 name="home" size={size} color={color} />)
                    }}
                />
                
                <Tabs.Screen
                    name='newPost'
                    options={{
                        title: "Nuevo Post",
                        tabBarIcon: ({ color, size }) => (<FontAwesome5 name="edit" size={size} color={color} />)
                    }}
                />
                <Tabs.Screen
                    name='profile'
                    options={{
                        title: "Perfil",
                        tabBarIcon: ({ color, size }) => (<FontAwesome5 name="user-circle" size={size} color={color} />)
                    }}
                />
                 <Tabs.Screen
                    name='favoritos'
                    options={{
                        title: "Favoritos",
                        tabBarIcon: ({ color, size }) => (<FontAwesome5 name="heart" size={size} color={color} />)
                    }}
                />
                <Tabs.Screen
                    name='ofertas'
                    options={{
                        title: "Ofertas",
                        tabBarIcon: ({ color, size }) => (<FontAwesome5 name="percent" size={size} color={color} />)
                    }}
                />
            </Tabs>
        </DataProvider>
    );
}
