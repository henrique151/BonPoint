import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "@/styles/header/header.styles";
import { router } from "expo-router";

export default function Header() {
  const [usuario, setUsuario] = useState<User | null>(null);

  const IrPefil = () => {
    router.push({
      pathname: "/profile",
    });
  };

  const IrHome = () => {
    router.push({
      pathname: "/",
    });
  };

  useEffect(() => {
    ConsultarUsuario();
  }, []);

  const ConsultarUsuario = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (storedUserId) {
        const userDocRef = doc(db, "Usuario", storedUserId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, "id">;
          setUsuario({ id: storedUserId, ...userData });
        } else {
          console.error("Usuário não encontrado no banco de dados.");
        }
      } else {
        console.error("ID do usuário não encontrado no AsyncStorage.");
      }
    } catch (error) {
      console.error("Erro ao consultar usuário:", error);
    }
  };

  // Função para limitar o nome do usuário
  const limitarNome = (nome: string, limite: number) => {
    if (nome.length > limite) {
      return nome.substring(0, limite) + "..."; // Limita o nome e adiciona '...'
    }
    return nome;
  };

  return (
    <View style={styles.backgroundFundo}>
      <View style={styles.container}>
        <TouchableOpacity onPress={IrPefil}>
          <View style={styles.userInfo}>
            {usuario && usuario.avatarUrl ? (
              <Image
                source={{ uri: usuario.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require("../../assets/images/User.png")}
                style={styles.avatar}
              />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.username}>Olá,</Text>
              <Text style={styles.greeting}>
                {usuario ? limitarNome(usuario.nome, 15) : "Usuário"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={IrHome}>
          <Image
            source={require("../../assets/images/pixelcut-export.png")}
            style={styles.logo}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
