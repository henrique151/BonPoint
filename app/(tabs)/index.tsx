import { View, Text, ScrollView, StyleSheet } from "react-native";
import React from "react";
import Home from "@/screens/home/home.screen";
import Colors from "@/constants/Colors";
import Header from "@/components/header/header";

export default function index() {
  return (
    <View style={styles.container}>
      <Header />
      <Home />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
