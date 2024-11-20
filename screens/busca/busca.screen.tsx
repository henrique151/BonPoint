import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { router } from "expo-router";
import Header from "@/components/header/header";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";

const BuscaScreen: React.FC = () => {
  const [busca, setBusca] = useState<string>(""); // Campo de busca
  const [confeitarias, setConfeitarias] = useState<Confeitaria[]>([]);
  const [confeitariasFiltradas, setConfeitariasFiltradas] = useState<
    Confeitaria[]
  >([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaMap, setCategoriaMap] = useState<{ [key: string]: string }>(
    {}
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [produtosMap, setProdutosMap] = useState<{ [key: string]: string }>({});
  const [noResults, setNoResults] = useState<boolean>(false); // Estado para controlar quando não há resultados

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const produtosRef = collection(db, "Produto");
        const querySnapshot = await getDocs(produtosRef);
        const fetchedProdutos: { [key: string]: string } = {};

        querySnapshot.forEach((doc) => {
          const data = { idProduto: doc.id, ...doc.data() };
          fetchedProdutos[data.idProduto] = data.nomeProduto; // Mapeia o idProduto para nomeProduto
        });

        setProdutosMap(fetchedProdutos);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };

    carregarProdutos();
  }, []);

  // Carregar categorias
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const categoriasRef = collection(db, "Categoria");
        const querySnapshot = await getDocs(categoriasRef);
        const fetchedCategorias: Categoria[] = [];
        const categoriasMap: { [key: string]: string } = {};

        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() } as Categoria;
          fetchedCategorias.push(data);
          categoriasMap[data.id] = data.nomeCategoria;
        });

        setCategorias(fetchedCategorias);
        setCategoriaMap(categoriasMap);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    };

    carregarCategorias();
  }, []);

  // Carregar confeitarias
  useEffect(() => {
    const carregarConfeitarias = async () => {
      setLoading(true);
      try {
        const confeitariaRef = collection(db, "Confeitaria");
        const querySnapshot = await getDocs(confeitariaRef);
        const fetchedConfeitarias: Confeitaria[] = [];

        querySnapshot.forEach((doc) => {
          const data = { idConfeitaria: doc.id, ...doc.data() } as Confeitaria;
          fetchedConfeitarias.push(data);
        });

        setConfeitarias(fetchedConfeitarias);
      } catch (error) {
        console.error("Erro ao carregar confeitarias:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarConfeitarias();
  }, []);

  // Função para filtrar confeitarias por nome ou produto
  useEffect(() => {
    if (busca.trim() === "") {
      setConfeitariasFiltradas([]); // Limpa a busca caso o campo esteja vazio
      setNoResults(false); // Reseta o estado de resultados
    } else {
      const filtradas = confeitarias.filter((confeitaria) => {
        // Verifica se o nome da confeitaria inclui a busca
        const nomeMatch = confeitaria.nome
          .toLowerCase()
          .includes(busca.toLowerCase());

        // Verifica se algum produto da confeitaria inclui a busca, usando os IDs dos produtos e o produtosMap
        const produtoMatch =
          confeitaria.produtos?.some(
            (produtoId) =>
              (produtosMap[produtoId]?.toLowerCase() || "").includes(
                busca.toLowerCase()
              ) // Verifica no mapa de produtos
          ) || false;

        return nomeMatch || produtoMatch; // Retorna true se houver correspondência no nome ou nome do produto
      });

      setConfeitariasFiltradas(filtradas);
      setNoResults(filtradas.length === 0); // Define se não há resultados
    }
  }, [busca, confeitarias, produtosMap]);

  // Função para filtrar por categoria
  const FiltrarPorCategoria = async (categoriaId: string) => {
    setLoading(true);
    try {
      const confeitariaRef = collection(db, "Confeitaria");
      const q = query(
        confeitariaRef,
        where("categoria", "array-contains", categoriaId)
      );

      const querySnapshot = await getDocs(q);
      const fetchedConfeitarias: Confeitaria[] = [];

      querySnapshot.forEach((doc) => {
        const data = { idConfeitaria: doc.id, ...doc.data() } as Confeitaria;
        fetchedConfeitarias.push(data);
      });

      setConfeitariasFiltradas(fetchedConfeitarias);
      setNoResults(fetchedConfeitarias.length === 0); // Define se não há resultados para a categoria
    } catch (error) {
      console.error("Erro ao filtrar confeitarias por categoria:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para renderizar item da categoria
  const renderCategoriaItem = ({ item }: { item: Categoria }) => (
    <TouchableOpacity
      style={styles.categoriaContainer}
      onPress={() => FiltrarPorCategoria(item.id)}
    >
      <Image source={{ uri: item.imagemUrl }} style={styles.categoriaIcon} />
      <Text style={styles.categoriaTexto}>{item.nomeCategoria}</Text>
    </TouchableOpacity>
  );

  // Função para renderizar categorias
  const renderCategorias = () => (
    <FlatList
      data={categorias}
      renderItem={renderCategoriaItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categoriasContainer}
    />
  );

  // Função para renderizar item da confeitaria
  const renderConfeitariaItem = ({ item }: { item: Confeitaria }) => (
    <TouchableOpacity
      style={styles.confeitariaContainer}
      onPress={() => VisualizarConfeitaria(item.idConfeitaria)}
    >
      <Image
        source={{ uri: item.imagemUrl }}
        style={styles.confeitariaImagem}
      />
      <View style={styles.confeitariaDetalhes}>
        <Text style={styles.confeitariaNome}>{item.nome}</Text>
        <Text style={styles.confeitariaEndereco}>
          Endereço: {item.endereco}
        </Text>
        <Text style={styles.confeitariaProdutos}>
          Categorias:{" "}
          {Array.isArray(item.categoria)
            ? item.categoria
                .map((catId) => categoriaMap[catId] || "N/A")
                .join(", ")
            : "Sem categoria"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Função para visualizar confeitaria selecionada
  const VisualizarConfeitaria = (idConfeitaria: string) => {
    router.push(`/confeitaria/${idConfeitaria}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff" }}>Carregando pesquisa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.containerSegundo}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#a5c5fd"
            style={styles.inputIcon}
          />
          <TextInput
            placeholder="O que procura? Confeitaria? Produto?"
            placeholderTextColor={"#a5c5fd"}
            value={busca}
            onChangeText={setBusca}
            style={styles.input}
          />
        </View>
        <Text style={styles.titulo}>Categorias do Produto</Text>
        {renderCategorias()}

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {noResults ? (
              <Text
                style={{
                  textAlign: "center",
                  marginVertical: 10,
                  color: "#Fff",
                  fontSize: 20,
                }}
              >
                Nenhuma confeitaria ou produto encontrado.
              </Text>
            ) : (
              <FlatList
                data={confeitariasFiltradas}
                renderItem={renderConfeitariaItem}
                keyExtractor={(item) => item.idConfeitaria}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      marginVertical: 10,
                      color: "#Fff",
                      fontSize: 20,
                    }}
                  >
                    Pesquise pelo nome da confeitaria ou produto, ou escolha uma
                    categoria.
                  </Text>
                }
                contentContainerStyle={{ paddingBottom: 20 }}
                style={{ flexGrow: 0 }}
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  containerSegundo: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  inputContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#a5c5fd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 19,
    color: Colors.BonPoint.Segundaria,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#003c8d",
  },
  categoriasContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  categoriaContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a5c5fd",
    borderRadius: 12,
    padding: 8,
    marginHorizontal: 8,
    width: 110,
    height: 110,
  },
  categoriaIcon: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    marginBottom: 5,
  },
  categoriaTexto: {
    textAlign: "center",
    fontSize: 20,
    color: "#4175c4",
  },
  confeitariaContainer: {
    marginTop: 12,
    borderRadius: 20,
    backgroundColor: Colors.BonPoint.Segundaria,
    flexDirection: "row",
    padding: 10,
  },
  confeitariaImagem: {
    marginTop: 5,
    width: 63,
    height: 63,
    borderRadius: 99,
    marginRight: 10,
  },
  confeitariaDetalhes: {
    flex: 1,
    justifyContent: "center",
  },
  confeitariaNome: {
    fontSize: 19,
    fontWeight: "bold",
    color: Colors.BonPoint.Setima,
  },
  confeitariaEndereco: {
    fontSize: 16,
    color: Colors.BonPoint.Quinta,
    fontWeight: "600",
  },
  confeitariaProdutos: {
    color: Colors.BonPoint.Quinta,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BuscaScreen;
