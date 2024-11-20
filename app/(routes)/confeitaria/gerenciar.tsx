import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { db, storage } from "@/config/FirebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { TextInputMask } from "react-native-masked-text";
import { router, useNavigation } from "expo-router";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";

interface Confeitaria {
  idConfeitaria: string;
  cnpj?: string;
  nome?: string;
  cpf?: string;
  cidade?: string;
  bairro?: string;
  endereco?: string;
  imagemUrl?: string;
  imagemUri?: string;
}

// Componente principal
export default function GerenciarConfeitariaScreen() {
  const [confeitarias, setConfeitarias] = useState<Confeitaria[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editedConfeitaria, setEditedConfeitaria] =
    useState<Confeitaria | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const VisualizarConfeitaria = (idConfeitaria: string) => {
    router.push(`/confeitaria/${idConfeitaria}`);
  };

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

  useEffect(() => {
    const buscarConfeitarias = async () => {
      if (!userId) return;

      try {
        const confeitariaCollection = collection(db, "Confeitaria");
        const q = query(confeitariaCollection, where("idUser", "==", userId));
        const confeitariaSnapshot = await getDocs(q);
        const confeitariaList = confeitariaSnapshot.docs.map((doc) => ({
          idConfeitaria: doc.id,
          ...doc.data(),
        })) as Confeitaria[];
        setConfeitarias(confeitariaList);
      } catch (error) {
        console.error("Erro ao buscar confeitarias: ", error);
      }
    };

    buscarConfeitarias();
  }, [userId]);

  const deletarProdutosConfeitaria = async (idUser: string) => {
    const produtosCollection = collection(db, "Produto");
    const q = query(produtosCollection, where("idUser", "==", idUser));
    const produtosSnapshot = await getDocs(q);

    const deletePromises = produtosSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
  };

  const deletarConfeitaria = async (idConfeitaria: string) => {
    Alert.alert(
      "Confirmação",
      "Você realmente deseja excluir esta confeitaria e todos os produtos associados?",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Cancelado"),
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              // Primeiro, deletar todos os produtos
              await deletarProdutosConfeitaria(idConfeitaria);

              // Em seguida, deletar a confeitaria
              await deleteDoc(doc(db, "Confeitaria", idConfeitaria));
              setConfeitarias((prevConfeitarias) =>
                prevConfeitarias.filter(
                  (confeitaria) => confeitaria.idConfeitaria !== idConfeitaria
                )
              );
              Alert.alert(
                "Sucesso",
                "Confeitaria e produtos deletados com sucesso!"
              );
              router.push(`/(tabs)/profile`);
            } catch (error) {
              console.error("Erro ao deletar confeitaria: ", error);
              Alert.alert("Erro", "Erro ao deletar confeitaria.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const concluirEdicao = async () => {
    if (editedConfeitaria) {
      setLoading(true);
      try {
        let imagemUrl = editedConfeitaria.imagemUrl;

        // Se uma nova imagem for selecionada, faça o upload
        if (editedConfeitaria.imagemUri) {
          const imagemPrincipalUrl = await uploadImage(
            editedConfeitaria.imagemUri,
            `BonPoint/${editedConfeitaria.idConfeitaria}/Confeitaria/imagemPrincipal`
          );
          imagemUrl = imagemPrincipalUrl; // Atualiza a URL da imagem
        }

        await setDoc(doc(db, "Confeitaria", editedConfeitaria.idConfeitaria), {
          ...editedConfeitaria,
          imagemUrl,
        });

        Alert.alert("Sucesso", "Confeitaria atualizada com sucesso!");

        setConfeitarias((prevConfeitarias) =>
          prevConfeitarias.map((confeitaria) =>
            confeitaria.idConfeitaria === editedConfeitaria.idConfeitaria
              ? { ...confeitaria, ...editedConfeitaria, imagemUrl }
              : confeitaria
          )
        );

        setEditedConfeitaria(null);
      } catch (error) {
        console.error("Erro ao atualizar confeitaria: ", error);
        Alert.alert("Erro", "Erro ao atualizar confeitaria.");
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

  const renderizarItemConfeitaria = ({ item }: { item: Confeitaria }) => (
    <View style={styles.confeitariaItem}>
      <Text style={styles.titulo}>Editar Confeitaria</Text>

      <TouchableOpacity onPress={() => pickImage()}>
        <Image
          source={{
            uri: editedConfeitaria?.imagemUri || item.imagemUrl,
          }}
          style={styles.confeitariaImage}
        />
        <View style={styles.backgroundIcon}>
          <Ionicons name="camera" size={47} style={styles.cameraIcon} />
        </View>
      </TouchableOpacity>

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

      {/* Campo Nome */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={editedConfeitaria?.nome || item.nome}
          onChangeText={(text) =>
            setEditedConfeitaria((prev) =>
              prev ? { ...prev, nome: text } : { ...item, nome: text }
            )
          }
          placeholder="Digite o Nome"
          placeholderTextColor={Colors.BonPoint.Oitava}
        />
      </View>

      {/* Campo CPF */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>CPF</Text>
        <TextInputMask
          type={"cpf"}
          style={styles.input}
          value={editedConfeitaria?.cpf || item.cpf}
          onChangeText={(text) =>
            setEditedConfeitaria((prev) =>
              prev ? { ...prev, cpf: text } : { ...item, cpf: text }
            )
          }
          placeholder="Digite o CPF"
          placeholderTextColor={Colors.BonPoint.Oitava}
        />
      </View>

      {/* Campo CNPJ */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>CNPJ</Text>
        <TextInputMask
          type={"cnpj"}
          style={styles.input}
          value={editedConfeitaria?.cnpj || item.cnpj}
          onChangeText={(text) =>
            setEditedConfeitaria((prev) =>
              prev ? { ...prev, cnpj: text } : { ...item, cnpj: text }
            )
          }
          placeholder="Digite o CNPJ"
          placeholderTextColor={Colors.BonPoint.Oitava}
        />
      </View>

      {/* Campo Cidade */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={editedConfeitaria?.cidade || item.cidade}
          onChangeText={(text) =>
            setEditedConfeitaria((prev) =>
              prev ? { ...prev, cidade: text } : { ...item, cidade: text }
            )
          }
          placeholder="Digite a Cidade"
          placeholderTextColor={Colors.BonPoint.Oitava}
        />
      </View>

      {/* Campo Bairro */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bairro</Text>
        <TextInput
          style={styles.input}
          value={editedConfeitaria?.bairro || item.bairro}
          onChangeText={(text) =>
            setEditedConfeitaria((prev) =>
              prev ? { ...prev, bairro: text } : { ...item, bairro: text }
            )
          }
          placeholder="Digite o Bairro"
          placeholderTextColor={Colors.BonPoint.Oitava}
        />
      </View>

      {/* Campo Endereço */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={editedConfeitaria?.endereco || item.endereco}
          onChangeText={(text) =>
            setEditedConfeitaria((prev) =>
              prev ? { ...prev, endereco: text } : { ...item, endereco: text }
            )
          }
          placeholder="Digite o Endereço"
          placeholderTextColor={Colors.BonPoint.Oitava}
        />
      </View>

      <View style={styles.confeitariaActions}>
        <TouchableOpacity onPress={concluirEdicao} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Concluir</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => VisualizarConfeitaria(item.idConfeitaria)}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Visualizar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => deletarConfeitaria(item.idConfeitaria)}
          style={styles.actionButton}
        >
          <Text style={styles.actionButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const pickImage = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!resultado.canceled) {
      // Atualiza o estado com a nova URI da imagem
      setEditedConfeitaria((prev) =>
        prev ? { ...prev, imagemUri: resultado.assets[0].uri } : prev
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.containerDois}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <FlatList
            data={confeitarias}
            renderItem={renderizarItemConfeitaria}
            keyExtractor={(item) => item.idConfeitaria}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerDois: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  confeitariaItem: {
    backgroundColor: Colors.BonPoint.Segundaria,
    borderRadius: 24,
    padding: 16,
    marginVertical: 4,
  },
  confeitariaImage: {
    width: "100%",
    height: 280, // 230 Print
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#fff",
    resizeMode: "cover",
  },
  titulo: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
  },
  backgroundIcon: {
    backgroundColor: "#fff",
    borderRadius: 99,
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    alignSelf: "center", // Centraliza o ícone horizontalmente abaixo da imagem
    bottom: -35, // Ajuste para o ícone ficar logo abaixo da imagem
    marginBottom: 15,
  },
  cameraIcon: {
    color: "#4175c4",
  },
  inputContainer: {
    marginVertical: 8,
  },
  label: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    color: "#fff",
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 5,
    padding: 6,
    fontSize: 20,
  },
  confeitariaActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  actionButton: {
    backgroundColor: "#4175c4",
    padding: 12,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
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
    top: 10,
    alignItems: "center",
    justifyContent: "center",
    left: 10,
  },
});
