import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { db, storage } from "@/config/FirebaseConfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { TextInputMask } from "react-native-masked-text";
import Colors from "@/constants/Colors";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ConfeitariaCadastrar() {
  const { _idUser } = useLocalSearchParams();
  const router = useRouter();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [endereco, setEndereco] = useState("");
  const [imagemPrincipal, setImagemPrincipal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userIdGuarde, setUserIdGuarde] = useState(""); // Declare state for userId
  const navigation = useNavigation();

  useEffect(() => {
    const buscarIdUsuario = async () => {
      try {
        const idUsuarioArmazenado = await AsyncStorage.getItem("userId");
        if (idUsuarioArmazenado) {
          setUserIdGuarde(idUsuarioArmazenado); // Set userId state with the stored ID
        }
      } catch (error) {
        console.error("Erro ao buscar ID do usuário: ", error);
      }
    };

    buscarIdUsuario();
  }, []); // Run once when component mounts

  // Determine the user ID based on the availability of _idUser or userIdGuarde
  const userId = Array.isArray(_idUser) ? _idUser[0] : _idUser || userIdGuarde;

  const VoltarPerfil = () => {
    router.push("/(tabs)/");
  };

  const pickImagemPrincipal = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Precisamos de permissão para acessar as fotos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImagemPrincipal(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string, path: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  };

  const CadastrarConfeitaria = async () => {
    // Validação: verificar se todos os campos foram preenchidos corretamente
    if (!name || name.trim() === "") {
      alert("O nome da confeitaria é obrigatório.");
      return;
    }

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/; // Formato CPF
    if (!cpf || !cpfRegex.test(cpf)) {
      alert("CPF inválido. O formato correto é 000.000.000-00.");
      return;
    }

    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/; // Formato CNPJ
    if (!cnpj || !cnpjRegex.test(cnpj)) {
      alert("CNPJ inválido. O formato correto é 00.000.000/0000-00.");
      return;
    }

    if (!cidade || cidade.trim() === "") {
      alert("A cidade é obrigatória.");
      return;
    }

    if (!bairro || bairro.trim() === "") {
      alert("O bairro é obrigatório.");
      return;
    }

    if (!endereco || endereco.trim() === "") {
      alert("O endereço é obrigatório.");
      return;
    }

    if (!imagemPrincipal) {
      alert("A imagem principal é obrigatória.");
      return;
    }

    try {
      setLoading(true);

      if (!userId) {
        alert("ID do usuário não encontrado.");
        setLoading(false);
        return;
      }

      const imagemPrincipalUrl = await uploadImage(
        imagemPrincipal,
        `BonPoint/${userId}/Confeitaria/imagemPrincipal`
      );

      // Use setDoc to create the document with userId as the document ID
      await setDoc(doc(db, "Confeitaria", userId), {
        idConfeitaria: userId,
        nome: name,
        cpf: cpf,
        cnpj: cnpj,
        cidade: cidade,
        bairro: bairro,
        endereco: endereco,
        imagemUrl: imagemPrincipalUrl,
        idUser: userId,
      });

      VoltarPerfil();
    } catch (error) {
      console.error("Erro ao adicionar confeitaria: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.scrollContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {loading ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>
                  Aguarde enquanto o cadastro está sendo processado...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.barra}>
                  <Text style={styles.title}>Registrar Confeitaria</Text>

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

                <View style={styles.iconContainer}>
                  <View style={styles.profileContainer}>
                    <TouchableOpacity onPress={pickImagemPrincipal}>
                      {imagemPrincipal ? (
                        <Image
                          source={{ uri: imagemPrincipal }}
                          style={styles.image}
                        />
                      ) : (
                        <FontAwesome
                          name="image"
                          size={260}
                          color="#fff"
                          style={styles.iconImagem}
                        />
                      )}
                      <View style={styles.backgroundIcon}>
                        <Ionicons
                          name="camera"
                          size={47}
                          style={styles.cameraIcon}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.caixaDebaixoLogo}>
                  <Text style={styles.imagemTexto}>
                    Escolha uma foto para a confeitaria
                  </Text>
                  <View style={styles.container_dois}>
                    <View style={styles.containerInput}>
                      {/* Nome da Confeitaria */}
                      <Text style={styles.tituloNome}>Nome da Confeitaria</Text>
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons
                          name="cupcake"
                          size={24}
                          color="gray"
                          style={styles.icon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Nome da Confeitaria"
                          placeholderTextColor="#fff"
                          value={name}
                          onChangeText={setName}
                        />
                      </View>

                      {/* CPF Input */}
                      <Text style={styles.tituloNome}>CPF</Text>
                      <View style={styles.inputContainer}>
                        <FontAwesome
                          name="id-card"
                          size={24}
                          color="gray"
                          style={styles.icon}
                        />
                        <TextInputMask
                          type={"cpf"}
                          style={styles.input}
                          placeholder="000.000.000-00"
                          placeholderTextColor="#fff"
                          value={cpf}
                          onChangeText={setCpf}
                        />
                      </View>

                      {/* CNPJ Input */}
                      <Text style={styles.tituloNome}>CNPJ</Text>
                      <View style={styles.inputContainer}>
                        <FontAwesome
                          name="building"
                          size={24}
                          color="gray"
                          style={styles.icon}
                        />
                        <TextInputMask
                          type={"cnpj"}
                          style={styles.input}
                          placeholder="00.000.000/0000-00"
                          placeholderTextColor="#fff"
                          value={cnpj}
                          onChangeText={setCnpj}
                        />
                      </View>

                      {/* Cidade Input */}
                      <Text style={styles.tituloNome}>Cidade</Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="location-city"
                          size={24}
                          color="gray"
                          style={styles.icon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Cidade"
                          placeholderTextColor="#fff"
                          value={cidade}
                          onChangeText={setCidade}
                        />
                      </View>

                      {/* Bairro Input */}
                      <Text style={styles.tituloNome}>Bairro</Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="home"
                          size={24}
                          color="gray"
                          style={styles.icon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Bairro"
                          placeholderTextColor="#fff"
                          value={bairro}
                          onChangeText={setBairro}
                        />
                      </View>

                      {/* Endereço Input */}
                      <Text style={styles.tituloNome}>Endereço</Text>
                      <View style={styles.inputContainer}>
                        <MaterialIcons
                          name="map"
                          size={24}
                          color="gray"
                          style={styles.icon}
                        />
                        <TextInput
                          style={styles.input}
                          placeholder="Endereço"
                          placeholderTextColor="#fff"
                          value={endereco}
                          onChangeText={setEndereco}
                        />
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.loginButton]}
                      onPress={CadastrarConfeitaria}
                    >
                      <Text style={styles.loginButtonText}>Cadastrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: Colors.BonPoint.Primaria,
  },
  container: {
    backgroundColor: Colors.BonPoint.Primaria,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    flex: 1,
  },
  container_dois: {
    padding: 20,
    width: "100%",
    flex: 1,
    zIndex: 2,
    alignItems: "center",
  },
  title: {
    fontSize: 29,
    fontWeight: "bold",
    color: Colors.BonPoint.Branco,
    textAlign: "center",
    marginTop: 25,
  },
  barra: {
    backgroundColor: "#658ece",
    width: "100%",
    padding: 0,
    height: 80,
    justifyContent: "center",
  },
  caixaDebaixoLogo: {
    marginTop: 40,
    width: "100%",
    height: "100%",
    backgroundColor: "#A5C6FC",
    top: 20,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imagemTexto: {
    textAlign: "center",
    fontSize: 23,
    color: Colors.BonPoint.Oitava,
    fontWeight: "bold",
    marginTop: 10,
  },
  backButtonText: {
    fontSize: 36,
    color: Colors.BonPoint.Branco,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 99,
    position: "absolute",
    top: 30,
    alignItems: "center",
    justifyContent: "center",
    left: 15,
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
    bottom: -50, // Ajuste para o ícone ficar logo abaixo da imagem
    marginBottom: 15,
  },
  cameraIcon: {
    color: "#4175c4",
  },
  iconImagem: {
    marginBottom: -15,
    zIndex: -1,
  },
  tituloNome: {
    color: Colors.BonPoint.Branco,
    marginBottom: 6,
    fontSize: 18,
    fontWeight: "600",
  },
  tituloSenha: {
    color: Colors.BonPoint.Branco,
    marginBottom: 6,
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 18,
    zIndex: -1,
    color: Colors.BonPoint.Branco,
  },
  imagePicker: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  imagePickerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedImage: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
  },
  profileContainer: {
    position: "relative", // Para permitir o posicionamento absoluto do ícone de câmera
    alignItems: "center",
  },
  iconContainer: {
    marginTop: 25,
  },
  containerInput: {
    width: "90%",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BonPoint.Branco,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginBottom: 10,
    backgroundColor: Colors.BonPoint.Nona,
  },
  icon: {
    marginRight: 10,
    color: Colors.BonPoint.Branco,
  },
  image: {
    width: 370,
    height: 250,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.BonPoint.Quinta,
  },
  loginButton: {
    backgroundColor: Colors.BonPoint.Primaria,
    borderRadius: 10,
    paddingVertical: 10,
    width: "50%",
    marginTop: 2,
    marginBottom: 30,
  },
  loginButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
