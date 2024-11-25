import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import { db, storage } from "@/config/FirebaseConfig";
import {
  collection,
  getDocs,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker"; // Import Picker

interface Produto {
  idProduto: string;
  nomeProduto: string;
  descricao: string;
  imagemProduto: string;
  idUser: string;
  categoria: string; // Ensure categoria is just a string
  imagemUri?: string;
}

interface Categoria {
  id: string;
  nomeCategoria: string;
  idConfeitaria: string;
}

export default function GerenciarProdutoScreen() {
  const { idProduto } = useLocalSearchParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editedProduto, setEditedProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]); // Change type to Categoria[]
  const [selectedCategoria, setSelectedCategoria] = useState<string>(""); // Mudei aqui para string vazia
  const navigation = useNavigation();

  const buscarIdUsuario = async () => {
    try {
      const idUsuarioArmazenado = await AsyncStorage.getItem("userId");
      if (idUsuarioArmazenado) {
        setUserId(idUsuarioArmazenado);
      }
    } catch (error) {
      console.error("Erro ao buscar ID do usuário: ", error);
    }
  };

  useEffect(() => {
    buscarIdUsuario();
  }, []);

  const consultarCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categoria"));

      const categoriasArray: Categoria[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        nomeCategoria: doc.data().nomeCategoria,
        idConfeitaria: doc.data().idConfeitaria,
      }));

      setCategorias(categoriasArray); // Set categories to state
    } catch (error) {
      console.error("Erro ao buscar categorias: ", error);
    }
  };

  useEffect(() => {
    const buscarProdutos = async () => {
      if (!userId) return;

      try {
        const produtoCollection = collection(db, "Produto");
        const q = query(produtoCollection, where("idUser", "==", userId));
        const produtoSnapshot = await getDocs(q);
        const produtoList = produtoSnapshot.docs.map((doc) => ({
          idProduto: doc.id,
          ...doc.data(),
        })) as Produto[];

        setProdutos(produtoList);

        const produtoParaEditar = produtoList.find(
          (produto) => produto.idProduto === idProduto
        );
        if (produtoParaEditar) {
          setEditedProduto({ ...produtoParaEditar });
          setSelectedCategoria(produtoParaEditar.categoria); // Set selected category from the product
        }
      } catch (error) {
        console.error("Erro ao buscar produtos: ", error);
      } finally {
        setLoading(false);
      }
    };

    buscarProdutos();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      consultarCategorias(); // Call to fetch categories once userId is available
    }
  }, [userId]);

  const concluirEdicao = async () => {
    if (editedProduto) {
      setLoading(true);
      try {
        let imagemUrl = editedProduto.imagemProduto;

        if (editedProduto.imagemUri) {
          const imagemPrincipalUrl = await uploadImage(
            editedProduto.imagemUri,
            `BonPoint/${userId}/Confeitaria/ProdutoMoficado/${editedProduto.idProduto}/imagemPrincipal`
          );
          imagemUrl = imagemPrincipalUrl;
        }

        await setDoc(doc(db, "Produto", editedProduto.idProduto), {
          ...editedProduto,
          imagemProduto: imagemUrl,
          categoria: selectedCategoria,
        });

        Alert.alert("Sucesso", "Produto atualizado com sucesso!");

        setProdutos((prevProdutos) =>
          prevProdutos.map((produto) =>
            produto.idProduto === editedProduto.idProduto
              ? {
                  ...produto,
                  ...editedProduto,
                  imagemProduto: imagemUrl,
                  categoria: selectedCategoria,
                }
              : produto
          )
        );

        router.push(`/(routes)/produtos/gerenciar`);
        setEditedProduto(null);
      } catch (error) {
        console.error("Erro ao atualizar produto: ", error);
        Alert.alert("Erro", "Erro ao atualizar produto.");
      } finally {
        setLoading(false);
      }
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const pickImage = async () => {
    if (editedProduto?.idProduto) {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!resultado.canceled) {
        setEditedProduto((prev) =>
          prev ? { ...prev, imagemUri: resultado.assets[0].uri } : prev
        );
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff" }}>Carregando produto...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        {editedProduto && (
          <View style={styles.produtoContainer}>
            <Text style={styles.titulo}>Editar Produto</Text>
            <View style={styles.profileContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <AntDesign
                  name="arrowleft"
                  size={22}
                  color="#fff"
                  style={styles.backButtonText}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                style={styles.profileContainer}
              >
                <Image
                  source={{
                    uri: editedProduto.imagemUri || editedProduto.imagemProduto,
                  }}
                  style={styles.produtoImage}
                />
                <View style={styles.backgroundIcon}>
                  <Ionicons
                    name="camera"
                    size={47}
                    color="#FFF"
                    style={styles.cameraIcon}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome do Produto</Text>
              <TextInput
                style={styles.input}
                value={editedProduto.nomeProduto}
                onChangeText={(text) =>
                  setEditedProduto((prev) =>
                    prev ? { ...prev, nomeProduto: text } : prev
                  )
                }
                placeholder="Nome do Produto"
                placeholderTextColor={"#fff"}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Descrição do Produto</Text>
              <TextInput
                style={styles.input}
                value={editedProduto.descricao}
                onChangeText={(text) =>
                  setEditedProduto((prev) =>
                    prev ? { ...prev, descricao: text } : prev
                  )
                }
                placeholder="Descrição do Produto"
                placeholderTextColor={"#fff"}
              />
            </View>
            <Text style={styles.label}>Categoria do Produto</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCategoria}
                style={styles.picker}
                onValueChange={(itemValue) => {
                  setSelectedCategoria(itemValue);
                  setEditedProduto((prev) =>
                    prev ? { ...prev, categoria: itemValue } : prev
                  ); // Update editedProduto's categoria
                }}
              >
                {categorias.map((categoria) => (
                  <Picker.Item
                    key={categoria.id}
                    label={categoria.nomeCategoria}
                    value={categoria.id}
                  />
                ))}
              </Picker>
            </View>

            <TouchableOpacity
              style={[styles.loginButton]}
              onPress={concluirEdicao}
            >
              <Text style={styles.loginButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  titulo: {
    textAlign: "center",
    marginBottom: 6,
    marginTop: -6,
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  produtoContainer: {
    backgroundColor: Colors.BonPoint.Segundaria,
    borderRadius: 24,
    padding: 16,
    width: "100%",
  },
  profileContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 20,
  },
  produtoImage: {
    width: screenWidth * 0.88, // Ajuste proporcional
    height: screenWidth * 0.6, // Ajuste proporcional
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.BonPoint.Branco,
  },
  backgroundIcon: {
    backgroundColor: "#fff",
    borderRadius: 99,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: -30,
    alignSelf: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 7,
    color: "#4175c4",
  },
  inputContainer: {
    marginVertical: 2,
    width: "100%",
  },
  input: {
    color: "#fff",
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#FFf",
    borderRadius: 8,
    fontSize: 19,
  },
  label: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 5,
  },
  pickerContainer: {
    borderColor: Colors.BonPoint.Branco,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#fff",
    borderWidth: 1,
    borderRadius: 8,
    marginTop: -3,
  },
  loginButton: {
    backgroundColor: Colors.BonPoint.Primaria,
    borderRadius: 10,
    paddingVertical: 10,
    width: "50%",
    alignSelf: "center",
    marginTop: 20,
  },
  loginButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    textAlign: "center",
  },
  backButton: {
    position: "absolute", // Posiciona o botão de volta dentro do contêiner
    top: 8, // Ajuste a posição vertical para ficar alinhado ao topo
    left: 2, // Ajuste a posição horizontal para o canto esquerdo
    backgroundColor: "#4175c4",
    width: 45,
    height: 45,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Garante que o botão esteja acima da imagem
  },
  backButtonText: {
    fontSize: 36,
    color: Colors.BonPoint.Branco,
  },
});
