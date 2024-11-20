import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons from Expo icons
import { db } from "@/config/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";
import { styles } from "@/styles/produto/produtoVis.styles";

export default function VisualizarProduto() {
  const { idProduto } = useLocalSearchParams();
  const router = useRouter(); // Hook to navigate back
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarProduto = async () => {
      try {
        if (typeof idProduto !== "string") {
          Alert.alert("Erro", "ID do produto inválido.");
          return;
        }

        const produtoDoc = doc(db, "Produto", idProduto);
        const produtoSnapshot = await getDoc(produtoDoc);

        if (produtoSnapshot.exists()) {
          setProduto({
            idProduto: produtoSnapshot.id,
            ...produtoSnapshot.data(),
          } as Produto);
        } else {
          Alert.alert("Erro", "Produto não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao carregar produto: ", error);
        Alert.alert("Erro", "Falha ao carregar o produto.");
      } finally {
        setLoading(false);
      }
    };

    carregarProduto();
  }, [idProduto]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#003c8d" />
        <Text>Carregando produto...</Text>
      </View>
    );
  }

  if (!produto) {
    return (
      <View style={styles.container}>
        <Text>Produto não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.containerScrollView}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <Header />
        <View style={styles.containerDois}>
          <View style={styles.card}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: produto.imagemProduto }}
                style={styles.imagemProduto}
              />
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={32}
                  color={Colors.BonPoint.Branco}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.nomeProduto}>{produto.nomeProduto}</Text>
            <Text style={styles.descricaoProduto}>{produto.descricao}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
