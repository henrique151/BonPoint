import { View, Text, StyleSheet } from "react-native";
import React from "react";
import ConversasScreen from "@/screens/conversas/conversas.screen";
import Colors from "@/constants/Colors";

export default function Order() {
  return (
    <View style={styles.container}>
      <ConversasScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
});
