import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ConfeitariaScreen from "@/screens/confeitaria/confeitaria.screen";
import Colors from "@/constants/Colors";

export default function Confeitaria() {
  const { idConfeitaria } = useLocalSearchParams();
  console.log("ID da confeitaria:", idConfeitaria);
  if (!idConfeitaria) {
    return <Text>ID não fornecido.</Text>;
  }

  return (
    <View style={styles.container}>
      <ConfeitariaScreen idConfeitaria={idConfeitaria as string} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
