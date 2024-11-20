import {
  View,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Text,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

// Obtendo as dimensões da tela
const screenWidth = Dimensions.get("window").width;

export default function WelcomeScreen() {
  const router = useRouter();

  const RealizarLogin = () => {
    router.push("/(routes)/login");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Logotipo */}
        <Image
          source={require("../../assets/images/fundoimagem.png")}
          style={styles.image}
        />
        <TouchableOpacity onPress={RealizarLogin} style={styles.button}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.BonPoint.Primaria,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Primaria,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    position: "relative",
    width: screenWidth,
    height: screenWidth * 2.2,
    zIndex: 1,
  },
  button: {
    width: "40%", // Ajusta a largura do botão para 40% da largura da tela
    position: "absolute",
    bottom: 125, // Ajuste a posição do botão
    left: "21%", // Centraliza horizontalmente
    transform: [{ translateX: -50 }],
    backgroundColor: Colors.BonPoint.Primaria, // Ajuste a cor conforme necessário
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    zIndex: 2,
  },
  buttonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 20,
    textAlign: "center",
  },
});
