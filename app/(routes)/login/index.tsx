import { View, Text, StyleSheet } from "react-native";
import React from "react";
import LoginScreen from "@/screens/login/login.screen";

export default function Login() {
  return (
    <View style={styles.container}>
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
