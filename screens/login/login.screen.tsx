import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/Colors";
import CryptoJS from "crypto-js";
import * as Notifications from "expo-notifications";

export default function LoginScreen() {
  const [userInfo, setUserInfo] = useState({
    nome: "",
    senha: "",
  });
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Estado para carregamento

  const RegistarScreen = () => {
    router.replace("/(routes)/registrar");
  };

  const SenhaScreen = () => {
    router.replace("/(routes)/senha");
  };


  
  const RealizarLogin = async () => {
    setIsLoading(true); // Ativar carregamento
    try {
      const isEmail = userInfo.nome.includes("@");
      const q = query(
        collection(db, "Usuario"),
        where(isEmail ? "email" : "nome", "==", userInfo.nome)
      );
  
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const storedPassword = userData.senha; // Senha armazenada (criptografada)
  
        // Verifica se o usuário já está logado
        if (userData.isLoggedIn) {
          Alert.alert(
            "Atenção",
            "O usuário já está logado em outro dispositivo ou sessão."
          );
          setIsLoading(false);
          return;
        }
  
        const hashedInputPassword = CryptoJS.SHA256(userInfo.senha).toString();
  
        if (hashedInputPassword === storedPassword) {
          const userId = userDoc.id;
          const token = `token_${userId}`;
          await AsyncStorage.setItem("access_token", token);
          await AsyncStorage.setItem("userId", userId);
  
          // Atualiza o status de login no Firestore
          await updateDoc(userDoc.ref, { isLoggedIn: true });
  
          const registerForPushNotificationsAsync = async () => {
            const { status: existingStatus } =
              await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
  
            if (existingStatus !== "granted") {
              const { status } = await Notifications.requestPermissionsAsync();
              finalStatus = status;
            }
  
            if (finalStatus !== "granted") {
              alert("Falha ao obter token de push notification!");
              return null;
            }
  
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            return token;
          };
  
          const pushToken = await registerForPushNotificationsAsync();
  
          if (pushToken) {
            if (userData.expoPushToken !== pushToken) {
              await updateDoc(userDoc.ref, { expoPushToken: pushToken });
            }
          }
  
          router.replace("/(tabs)");
        } else {
          Alert.alert("Erro de Login", "Senha incorreta");
        }
      } else {
        Alert.alert("Erro de Login", "Usuário não encontrado");
      }
    } catch (error) {
      console.error("Erro ao realizar login: ", error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao tentar realizar o login. Por favor, tente novamente."
      );
    } finally {
      setIsLoading(false); // Desativar carregamento
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        <View style={styles.barra}>
          <Text style={styles.title}>Login</Text>
        </View>
  
        <Image
          source={require("../../assets/images/pixelcut-export.png")}
          style={styles.logo}
        />
  
        <View style={styles.caixaDebaixoLogo}>
          <View style={styles.container_dois}>
            <View style={styles.labelContainer}>
              <Text style={styles.tituloNome}>Email ou Nome Completo:</Text>
            </View>
  
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="email"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                placeholder="Insira seu e-mail ou nome completo"
                placeholderTextColor="#FFFFFF"
                style={styles.input}
                value={userInfo.nome}
                onChangeText={(value) =>
                  setUserInfo({ ...userInfo, nome: value })
                }
              />
            </View>
  
            <View style={styles.labelContainer}>
              <Text style={styles.tituloSenha}>Senha:</Text>
            </View>
  
            <View style={styles.inputContainer}>
              <MaterialIcons
                name="lock"
                size={24}
                color="gray"
                style={styles.icon}
              />
              <TextInput
                placeholder="Insira sua senha"
                placeholderTextColor="#FFFFFF"
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={userInfo.senha}
                onChangeText={(value) =>
                  setUserInfo({ ...userInfo, senha: value })
                }
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              >
                <MaterialIcons
                  name={isPasswordVisible ? "visibility" : "visibility-off"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
  
            <View style={styles.linksContainer}>
              <TouchableOpacity
                style={styles.registerContainer}
                onPress={RegistarScreen}
              >
                <Text style={styles.registerText}>
                  Novo Usuário?{" "}
                  <Text style={styles.registerLink}>Registrar</Text>
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={SenhaScreen}
              >
                <Text style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </Text>
              </TouchableOpacity>
            </View>
  
            <TouchableOpacity
              style={styles.loginButton}
              onPress={RealizarLogin}
            >
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
  
        {isLoading && ( // Exibe a tela de loading como sobreposição
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={{ color: "#fff", marginTop: 10 }}>Carregando login...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};  

export const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#4175C4",
  },
  container: {
    backgroundColor: "#4175C4",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
    flex: 1,
  },
  loadingContainer: {
    position: "absolute", // Torna o View uma sobreposição
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fundo semitransparente
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Garante que fique acima de outros elementos
  },
  container_dois: {
    padding: 20,
    width: "100%",
    zIndex: 2,
    alignItems: "center",
    marginTop: -40,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.BonPoint.Branco,
    textAlign: "center",
    marginTop: 15,
  },
  barra: {
    backgroundColor: "#6390CB",
    width: "100%",
    padding: 0,
    height: 100,
    justifyContent: "center",
  },
  logo: {
    width: 360,
    height: 360,
    resizeMode: "contain",
    marginTop: -25,
  },
  caixaDebaixoLogo: {
    width: "100%",
    backgroundColor: "#A5C6FC",
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 40,
    //justifyContent: 'center'
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BonPoint.Quinta,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    backgroundColor: "#4174C3",
    zIndex: 2,
  },
  icon: {
    marginRight: 10,
    color: Colors.BonPoint.Branco,
  },
  labelContainer: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 6,
    zIndex: 2,
  },
  tituloNome: {
    color: Colors.BonPoint.Branco,
    marginBottom: 2,
    fontSize: 18,
    zIndex: 2,
    marginTop: 70,
    fontWeight: "bold",
  },
  tituloSenha: {
    color: Colors.BonPoint.Branco,
    marginBottom: 2,
    fontSize: 18,
    zIndex: 2,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    zIndex: 2,
  },
  linksContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    zIndex: 2,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 3,
  },
  registerContainer: {
    alignSelf: "flex-start",
  },
  registerText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    fontWeight: "800",
  },
  registerLink: {
    color: "#4175C4",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#4174C3",
    borderRadius: 30,
    paddingVertical: 11,
    paddingHorizontal: 50,
    width: "50%", // Keep the width as desired
    alignItems: "center",
    alignSelf: "center", // Center the button horizontally
    marginTop: 60,
  },
  loginButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
