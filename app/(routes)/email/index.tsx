import { View, StyleSheet, ScrollView } from "react-native";
import React from "react";
import ConfirmaScreen from "@/screens/email/confirma.screen";
import Colors from "@/constants/Colors";

export default function Email() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container_dois}>
        <ConfirmaScreen />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Primaria,
  },
  container_dois: {
    width: "100%",
    padding: 20,
  },
});
