import { View, Text, StyleSheet } from "react-native";
import React from "react";
import PerfilScreen from "@/screens/perfil/perfil.screen";

export default function Profile() {
  return (
    <View style={styles.container}>
      <PerfilScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});