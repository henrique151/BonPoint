import {
  View,
  Image,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

// Componente principal
const screenWidth = Dimensions.get("window").width;

export default function BemVindoScreen() {
  const TelaInicio = () => {
    router.push("/inicio");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/bem-vindo (1).png")}
            style={styles.image}
          />

          {/* Contêiner de conteúdo com botão */}
          <View style={styles.contentContainer}>
            <TouchableOpacity style={styles.loginButton} onPress={TelaInicio}>
              <Text style={styles.loginButtonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    backgroundColor: Colors.BonPoint.Primaria,
    flex: 1,
    alignItems: "center",
  },
  imageContainer: {
    width: screenWidth,
    height: screenWidth * 2.2, // Ajuste proporcional
    position: "relative", // Adiciona position relative aqui
  },
  image: {
    width: "100%",
    height: "100%",
    zIndex: 1, // Mantém a imagem em fundo
  },
  contentContainer: {
    position: "absolute", // Torna o contêiner absoluto
    left: 0,
    right: 0,
    bottom: 110, // Ajuste essa distância se necessário
    alignItems: "center", // Centraliza horizontalmente o conteúdo
    zIndex: 2, // Garante que o conteúdo fique acima da imagem
  },
  loginButton: {
    backgroundColor: Colors.BonPoint.Segundaria, // Verifique se essa cor contrasta com a imagem
    padding: 12,
    borderRadius: 12,
    width: 240,
    height: "auto",
    alignItems: "center",
  },
  loginButtonText: {
    color: "white", // Cor do texto do botão
    fontSize: 20,
    fontWeight: "bold",
  },
  welcomeText: {
    color: "white",
    textAlign: "center", // Centraliza o texto
  },
});
