import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.BonPoint.Setima,  
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Início",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={32} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        }}
      />
      <Tabs.Screen
        name="explore/index"
        options={{
          headerShown: false,
          title: "Busca",
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" size={32} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        }}
      />
      <Tabs.Screen
        name="order/index"
        options={{
          headerShown: false,
          title: "Histórico",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={32} color={color} /> 
          ),
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          headerShown: false,
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user-o" size={32} color={color} />
          ),
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: 'bold',
          },
        }}
      />
    </Tabs>
  );
}
