import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  PixelRatio,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "@/config/FirebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import Header from "@/components/header/header";
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { Picker } from "@react-native-picker/picker";

type Categoria = {
  id: string;
  nomeCategoria: string;
  idConfeitaria: string;
};

export default function AdicionarProduto() {
  const [nomeProduto, setNomeProduto] = useState<string>("");
  const [descricaoProduto, setDescricaoProduto] = useState<string>("");
  const [imagemProduto, setImagemProduto] = useState<string | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [idUser, setIdUser] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const navigation = useNavigation();
  const voltarGerenciar = () => {
    router.push("/produtos/gerenciar");
  };

  useEffect(() => {
    consultarUsuario();
    consultarCategorias();
  }, []);

  const consultarUsuario = async () => {
    const userId = await AsyncStorage.getItem("userId");
    setIdUser(userId);
  };

  const consultarCategorias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Categoria"));

      const categoriasArray: Categoria[] = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          nomeCategoria: doc.data().nomeCategoria,
          idConfeitaria: doc.data().idConfeitaria,
        }))
        .filter((categoria) => categoria.nomeCategoria);

      setCategorias(categoriasArray);

      if (categoriasArray.length > 0) {
        setCategoriaSelecionada(categoriasArray[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar categorias: ", error);
    }
  };

  const selecionarImagemProduto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Precisamos de permissão para acessar as fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagemProduto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (
      !nomeProduto ||
      !descricaoProduto ||
      !categoriaSelecionada ||
      !imagemProduto ||
      !idUser
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(imagemProduto);
      const blob = await response.blob();

      const storageRef = ref(
        storage,
        `BonPoint/${idUser}/Confeitaria/Produtos/${Date.now()}`
      );
      await uploadBytes(storageRef, blob);
      const imagemUrl = await getDownloadURL(storageRef);

      const produtoRef = await addDoc(collection(db, "Produto"), {
        idUser,
        nomeProduto,
        categoria: categoriaSelecionada,
        descricao: descricaoProduto,
        idProduto: "",
        imagemProduto: imagemUrl,
      });

      await updateDoc(doc(db, "Produto", produtoRef.id), {
        idProduto: produtoRef.id,
      });

      const userRef = doc(db, "Confeitaria", idUser);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const produtosUser = userDoc.data().produtos || [];
        const categoriaId = userDoc.data().categoria || [];
        const categoriaAtualizada = Array.from(
          new Set([...categoriaId, categoriaSelecionada])
        );

        await updateDoc(userRef, {
          produtos: [...produtosUser, produtoRef.id],
          categoria: categoriaAtualizada,
        });
      } else {
        console.error("Usuário não encontrado.");
      }

      voltarGerenciar();
    } catch (error) {
      console.error("Erro ao adicionar produto: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>
              Aguarde enquanto o cadastro está sendo processado...
            </Text>
          </View>
        )}
        <View style={styles.produtoContainer}>
          <View style={styles.iconContainer}>
            <View style={styles.profileContainer}>
              <TouchableOpacity onPress={selecionarImagemProduto}>
                {imagemProduto ? (
                  <Image source={{ uri: imagemProduto }} style={styles.image} />
                ) : (
                  <FontAwesome
                    name="image"
                    size={230}
                    color="#fff"
                    style={styles.iconImagem}
                  />
                )}
                <View style={styles.backgroundIcon}>
                  <Ionicons name="camera" size={47} style={styles.cameraIcon} />
                </View>
              </TouchableOpacity>
            </View>
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
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nome do Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto"
              value={nomeProduto}
              onChangeText={setNomeProduto}
              multiline
              placeholderTextColor={"#fff"}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descrição do Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Descrição do Produto"
              value={descricaoProduto}
              onChangeText={setDescricaoProduto}
              multiline
              placeholderTextColor={"#fff"}
            />
          </View>

          <Text style={styles.label}>Categoria do Produto:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoriaSelecionada}
              style={styles.picker}
              onValueChange={(itemValue) => setCategoriaSelecionada(itemValue)}
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
          <Text style={styles.titulo}>Adicionar Produto</Text>
          <TouchableOpacity style={[styles.loginButton]} onPress={handleSubmit}>
            <Text style={styles.loginButtonText}>Adicionar Produto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  scrollViewContainer: {
    flexGrow: 1, // Permite que o ScrollView cresça conforme necessário
    justifyContent: "center", // Centraliza verticalmente
    alignItems: "center", // Centraliza horizontalmente
    padding: 16,
  },
  produtoContainer: {
    backgroundColor: Colors.BonPoint.Segundaria,
    borderRadius: 24,
    padding: 16,
    width: "100%",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  input: {
    color: "#fff",
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#FFf",
    borderRadius: 8,
    fontSize: 18
  },
  profileContainer: {
    position: "relative",
  },
  image: {
    width: PixelRatio.getPixelSizeForLayoutSize(135),
    height: PixelRatio.getPixelSizeForLayoutSize(90),
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.BonPoint.Branco,
    alignSelf: "center",
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
    color: "#4175c4",
  },
  titulo: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  iconImagem: {
    marginBottom: -15,
    zIndex: -1,
  },
  inputContainer: {
    marginVertical: 4,
    width: "100%",
  },
  label: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginVertical: 5,
  },
  pickerContainer: {
    borderColor: Colors.BonPoint.Branco,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  picker: {
    color: "#FFF",
  },
  loginButton: {
    backgroundColor: Colors.BonPoint.Primaria,
    borderRadius: 10,
    paddingVertical: 10,
    width: "50%",
    alignSelf: "center",
  },
  loginButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.BonPoint.Primaria,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 36,
    color: Colors.BonPoint.Branco,
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: "#4175c4",
    borderRadius: 99,
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    top: 10,
    left: 0,
  },
});
