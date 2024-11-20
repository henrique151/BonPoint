import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { styles } from "@/styles/gerenciar/gerenciar.styles";
import { db } from "@/config/FirebaseConfig";
import {
  getDocs,
  collection,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import Header from "@/components/header/header";
import { AntDesign } from "@expo/vector-icons";

export default function GerenciarProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [idUser, setIdUser] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // State to manage refreshing
  const navigation = useNavigation();

  useEffect(() => {
    const carregarProdutos = async () => {
      setLoading(true);
      try {
        const userId = await AsyncStorage.getItem("userId");
        setIdUser(userId);

        if (userId) {
          const produtosQuery = query(
            collection(db, "Produto"),
            where("idUser", "==", userId)
          );
          const querySnapshot = await getDocs(produtosQuery);

          const produtosData: Produto[] = querySnapshot.docs.map((doc) => ({
            idProduto: doc.id,
            nomeProduto: doc.data().nomeProduto,
            imagemProduto: doc.data().imagemProduto,
            categoria: doc.data().categoria,
            descricao: doc.data().descricao,
            idUser: doc.data().idUser,
          }));
          setProdutos(produtosData);
        }
      } catch (error) {
        Alert.alert("Erro", "Falha ao carregar os produtos.");
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setLoading(false);
        setRefreshing(false); // Stop refreshing
      }
    };

    carregarProdutos();
  }, [refreshing]); // Depend on refreshing state to reload products

  const adicionarProduto = () => {
    router.push({ pathname: "/(routes)/produtos/adicionar" });
  };

  const VoltarPerfil = () => {
    router.push({ pathname: "/(tabs)/profile" });
  };

  const editarProduto = (idProduto: string) => {
    router.push({
      pathname: "/(routes)/produtos/alterar",
      params: { idProduto },
    });
  };

  const visualizarProduto = (idProduto: string) => {
    router.push({
      pathname: "/(routes)/produtos/visualizar",
      params: { idProduto },
    });
  };

  // Updated function to accept product name as a parameter
  const excluirProduto = async (id: string, nomeProduto: string) => {
    Alert.alert(
      "Excluir",
      `Deseja realmente excluir o produto ${nomeProduto}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Produto", id)); // Delete the product from Firestore
              setProdutos((prevProdutos) =>
                prevProdutos.filter((produto) => produto.idProduto !== id)
              );
              Alert.alert("Sucesso", "Produto excluído com sucesso."); // Success message
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir o produto.");
              console.error("Erro ao excluir produto:", error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Produto }) => (
    <View style={styles.produtoContainer}>
      <Image
        source={{ uri: item.imagemProduto }}
        style={styles.produtoImagem}
      />
      <View>
        <Text style={styles.produtoTitulo}>{item.nomeProduto}</Text>
        <View style={styles.botaoContainer}>
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => editarProduto(item.idProduto)}
          >
            <Text style={styles.botaoTexto}>Editar</Text>
          </TouchableOpacity>
          {/* Pass the product name to the excluirProduto function */}
          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => excluirProduto(item.idProduto, item.nomeProduto)}
          >
            <Text style={styles.botaoTexto}>Excluir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoVisualizar}
            onPress={() => visualizarProduto(item.idProduto)}
          >
            <Text style={styles.botaoTexto}>Visualizar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff" }}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.containerDois}>
        <TouchableOpacity style={styles.backButton} onPress={VoltarPerfil}>
          <AntDesign
            name="arrowleft"
            size={22}
            color="#fff"
            style={styles.backButtonText}
          />
        </TouchableOpacity>
        <Text style={styles.tituloPagina}>Gerenciamento de Produtos</Text>
        <Text style={styles.subtitulo}>
          Aqui você pode gerenciar seus produtos, editá-los, excluí-los ou
          visualizar mais detalhes.
        </Text>

        {produtos.length === 0 ? (
          <TouchableOpacity
            style={styles.adicionarProdutoContainer}
            onPress={adicionarProduto}
          >
            <Image
              source={require("@/assets/images/editor-Produto.png")}
              style={styles.adicionarProdutoImagem}
            />
            <Text style={styles.adicionarProdutoTexto}>Adicionar produto</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={produtos}
            renderItem={renderItem}
            keyExtractor={(item) => item.idProduto}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.adicionarProdutoContainer}
                onPress={adicionarProduto}
              >
                <Image
                  source={require("@/assets/images/editor-Produto.png")}
                  style={styles.adicionarProdutoImagem}
                />
                <Text style={styles.adicionarProdutoTexto}>
                  Adicionar produto
                </Text>
              </TouchableOpacity>
            }
            onRefresh={() => {
              setRefreshing(true);
            }}
            refreshing={refreshing}
          />
        )}
      </View>
    </View>
  );
}
