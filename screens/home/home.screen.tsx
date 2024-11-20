import { View, ScrollView, Text, StyleSheet } from "react-native";
import React from "react";
import HomeConfeitaria from "@/components/home/home.confeitaria";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);
export default function HomeScreen() {
  return (
    <View style={styles.screenContainer}>
      <ScrollView  showsVerticalScrollIndicator={false}>
        <HomeConfeitaria />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  screenContainer: {
    backgroundColor: "#658ece",
    flex: 1,
  },
});
