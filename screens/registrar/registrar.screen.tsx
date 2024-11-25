import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db, storage } from "@/config/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  AntDesign,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { router } from "expo-router";
import CryptoJS from "crypto-js"; 
import { TextInputMask } from "react-native-masked-text";
import axios from "axios";
import { styles } from "@/styles/registrar/registrar.styles";

export default function RegistarScreen() {
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isPasswordVisibleDois, setPasswordVisibleDois] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [userType, setUserType] = useState<string>("Confeiteiro");
  const [userInfo, setUserInfo] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
  });
  const [error, setError] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEmailExist, setIsEmailExist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (
      userInfo.nome &&
      userInfo.email &&
      userInfo.senha &&
      userInfo.telefone &&
      userInfo.confirmarSenha &&
      !error.email &&
      !error.senha &&
      !error.telefone &&
      userInfo.senha === userInfo.confirmarSenha
    ) {
      setIsFormValid(true);
    } else {
      setIsFormValid(false);
    }
  }, [userInfo, error]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const WelcomeScreen = () => {
    router.replace("/(routes)/login");
  };

  const uploadImage = async (imageUri: string) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    const storageRef = ref(
      storage,
      `BonPoint/Usuario_${Date.now()}/${Date.now()}`
    );
    await uploadBytes(storageRef, blob);

    // Obtenha a URL do arquivo enviado
    const avatarUrl = await getDownloadURL(storageRef);
    console.log("URL da imagem 1:", avatarUrl);
    // Codifique a URL corretamente
    const encodedUrl = encodeURIComponent(avatarUrl);

    return encodedUrl; // Retorna a URL codificada do avatar
  };

  const checkEmailExists = async (email: string) => {
    const usersCollectionRef = collection(db, "Usuario");
    const q = query(usersCollectionRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    return !querySnapshot.empty;
  };

  const RegistrarUser = async () => {
    if (!isFormValid) {
      Alert.alert("Formulário Incompleto", "Por favor, preencha todos os campos obrigatórios corretamente.");
      return;
    }
  
    setIsLoading(true); // Ativa o carregamento
    const emailExists = await checkEmailExists(userInfo.email);
    if (emailExists) {
      setError({ ...error, email: "Email já cadastrado" });
      setIsEmailExist(true);
      setIsLoading(false); // Desativa o carregamento se o e-mail existir
      return;
    }
  
    try {
      if (!userInfo.senha || userInfo.senha.length < 6) {
        setError({
          ...error,
          senha: "Senha deve ter pelo menos 6 caracteres.",
        });
        setIsLoading(false); // Desativa o carregamento se a senha for inválida
        return;
      }
  
      const avatarUrl = image
        ? await uploadImage(image)
        : "";
  
      const confirmationCode = generateConfirmationCode();
      await sendConfirmationEmail(userInfo.email, confirmationCode);
  

      console.log("URL da imagem 2:", avatarUrl);
      setIsLoading(false); // Desativa o carregamento ao terminar
      router.push({
        pathname: "/(routes)/email",
        params: {
          nome: userInfo.nome,
          email: userInfo.email,
          codigoEmail: confirmationCode,
          senha: userInfo.senha,
          imagemPerfil: avatarUrl,
          tipoUsuarioNovo: userType,
          telefone: userInfo.telefone,
        },
      });
    } catch (e) {
      console.error("Error registering user: ", e);
      setIsLoading(false); // Desativa o carregamento em caso de erro
    }
  };

  const ValidarNome = (value: string) => {
    if (value.trim() === "") {
      setError({ ...error, nome: "O nome não pode estar vazio" });
    } else {
      setError({ ...error, nome: "" });
    }
    setUserInfo({ ...userInfo, nome: value });
  };

  const ValidarEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      setError({ ...error, email: "Formato de email inválido" });
    } else {
      setError({ ...error, email: "" });
      setIsEmailExist(false);
    }
    setUserInfo({ ...userInfo, email: value });
  };

  const ValidarSenha = (value: string) => {
    const senhaSpecialCharacter = /(?=.*[!@#$%^&*(),.?":{}|<>])/;
    const senhaOneNumber = /(?=.*[0-9])/;
    const senhaSixValue = /(?=.{6,})/;

    let errorMessage = "";

    if (!senhaSpecialCharacter.test(value)) {
      errorMessage = "Escreva pelo menos um caractere especial";
    } else if (!senhaOneNumber.test(value)) {
      errorMessage = "Escreva pelo menos um número";
    } else if (!senhaSixValue.test(value)) {
      errorMessage = "Escreva pelo menos 6 caracteres";
    }

    setError({ ...error, senha: errorMessage });
    setUserInfo({ ...userInfo, senha: value });
  };

  const ValidarConfirmacaoSenha = (value: string) => {
    if (value !== userInfo.senha) {
      setError({ ...error, confirmarSenha: "As senhas não coincidem" });
    } else {
      setError({ ...error, confirmarSenha: "" });
    }
    setUserInfo({ ...userInfo, confirmarSenha: value });
  };

  const ValidarTelefone = (value: string) => {
    // Remover a máscara para validação
    const rawValue = value.replace(/\D/g, "");
    const phonePattern = /^[0-9]{10,14}$/;

    if (!phonePattern.test(rawValue)) {
      setError({ ...error, telefone: "Número de telefone inválido" });
    } else {
      setError({ ...error, telefone: "" });
    }
    setUserInfo({ ...userInfo, telefone: value });
  };

  const sendConfirmationEmail = async (email: string, codigo: string) => {
    try {
      const response = await axios.post("http://192.168.1.2:3000/send-email", {
        email: email,
        codigo: codigo,
      });
      if (response.status === 200) {
        console.log("E-mail enviado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao enviar o e-mail de confirmação:", error);
    }
  };

  const generateConfirmationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Gera um código de 6 dígitos
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        flexGrow: 1,
        height: "100%",
      }}
    >
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : (
          <>
            <View style={styles.containerTitle}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={WelcomeScreen}
              >
                <AntDesign
                  name="arrowleft"
                  size={24}
                  color="#fff"
                  style={styles.backButtonText}
                />
              </TouchableOpacity>

              <Text style={styles.title}>Registrar Usuário</Text>

              <View style={styles.iconContainer}>
                <View style={styles.profileContainer}>
                  <TouchableOpacity onPress={pickImage}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.image} />
                    ) : (
                      <FontAwesome
                        name="user-circle-o"
                        size={185}
                        color="#fff"
                      />
                    )}
                    <View style={styles.backgroundIcon}>
                      <Ionicons
                        name="camera"
                        size={43}
                        style={styles.cameraIcon}
                        color="#004AAD"
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.imagemTexto}>Escolha uma foto de perfil</Text>
            </View>

            <View style={styles.containerInput}>
              <View>
                <Text style={styles.tituloSenha}>Nome:</Text>
              </View>

              {error.nome ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error.nome}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <FontAwesome
                  name="user-circle"
                  size={24}
                  color="black"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="Insira seu nome de usuário"
                  placeholderTextColor={"#fff"}
                  style={styles.input}
                  value={userInfo.nome}
                  onChangeText={ValidarNome}
                />
              </View>

              <View>
                <Text style={styles.tituloNome}>Email:</Text>
              </View>

              {error.email ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error.email}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="email"
                  size={24}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="Insira seu email"
                  keyboardType="email-address"
                  placeholderTextColor={"#fff"}
                  style={styles.input}
                  value={userInfo.email}
                  onChangeText={ValidarEmail}
                />
              </View>

              <View>
                <Text style={styles.tituloNome}>Telefone:</Text>
              </View>

              {error.telefone ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error.telefone}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="phone"
                  size={24}
                  color="gray"
                  style={styles.icon}
                />
                <TextInputMask
                  type={"custom"}
                  options={{
                    mask: "99 99999-9999", // A máscara desejada
                  }}
                  placeholder="Insira seu telefone"
                  placeholderTextColor={"#fff"}
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={userInfo.telefone}
                  onChangeText={ValidarTelefone}
                />
              </View>

              <View>
                <Text style={styles.tituloSenha}>Senha:</Text>
              </View>
              {error.senha ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error.senha}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="lock"
                  size={24}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="Insira sua senha"
                  placeholderTextColor={"#fff"}
                  secureTextEntry={!isPasswordVisible}
                  style={styles.input}
                  value={userInfo.senha}
                  onChangeText={ValidarSenha}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <Ionicons name="eye-outline" size={24} color="#fff" />
                  ) : (
                    <Ionicons name="eye-off-outline" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.tituloSenha}>Confirmar Senha:</Text>
              </View>

              {error.confirmarSenha ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error.confirmarSenha}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="lock"
                  size={24}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  placeholder="Confirma sua senha"
                  placeholderTextColor={"#fff"}
                  style={styles.input}
                  secureTextEntry={!isPasswordVisibleDois}
                  value={userInfo.confirmarSenha}
                  onChangeText={ValidarConfirmacaoSenha}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisibleDois(!isPasswordVisibleDois)}
                >
                  {isPasswordVisibleDois ? (
                    <Ionicons name="eye-outline" size={24} color="#fff" />
                  ) : (
                    <Ionicons name="eye-off-outline" size={24} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>

              <View>
                <Text style={styles.tituloSenha}>Tipo de Usuário</Text>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={userType}
                  style={styles.picker}
                  onValueChange={(itemValue) => setUserType(itemValue)}
                >
                  <Picker.Item
                    style={styles.pickerLabel}
                    label="Confeiteiro"
                    value="Confeiteiro"
                  />
                  <Picker.Item
                    style={styles.pickerLabel}
                    label="Organizador"
                    value="Organizador"
                  />
                </Picker>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton]}
              onPress={RegistrarUser}
            >
              <Text style={styles.loginButtonText}>Registrar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
