import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { styles } from "@/styles/email/email.style";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "crypto-js";
import * as Notifications from "expo-notifications";

const iconUrl = require("../../assets/images/logo.png");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    icon: iconUrl,
  }),
});

export default function ConfirmaScreen() {
  const router = useRouter();
  const {
    nome,
    email,
    codigoEmail,
    imagemPerfil,
    telefone,
    senha,
    tipoUsuarioNovo,
  } = useLocalSearchParams();

  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const inputRefs = useRef<TextInput[]>([]);

  const generateToken = (userId: string) => {
    return `token_${userId}`;
  };

  console.log("Código recebido:", codigoEmail);


  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Push Notification Token:", token);
    return token;
  };

  const MudandacaDoInput = (text: string, index: number) => {
    // Permitir apenas números
    const newText = text.replace(/[^0-9]/g, "");

    const newCodigo = [...codigo];
    newCodigo[index] = newText;
    setCodigo(newCodigo);

    // Avança para o próximo campo automaticamente, se houver
    if (newText && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const confirmarCodigo = async () => {
    setIsLoading(true);
    const codigoInserido = codigo.join("");
    if (codigoInserido === codigoEmail) {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        setExpoPushToken(pushToken);

        // Usa imagemPerfil ou define a URL padrão caso imagemPerfil esteja vazio ou indefinido
        const avatarUrl = imagemPerfil && imagemPerfil.trim() !== ""
          ? imagemPerfil
          : "https://firebasestorage.googleapis.com/v0/b/bonpoint-b01e4.appspot.com/o/BonPoint%2FAdmin%2Fperfil.png?alt=media&token=c82cb075-781f-4469-9c0b-27ecdc065e19";

        console.log('Url Imagem 4', avatarUrl)

        const userId = `Usuario_${Date.now()}`;
        const userDocRef = doc(db, "Usuario", userId);
        const hashedPassword = CryptoJS.SHA256(senha).toString();

        await setDoc(userDocRef, {
          id: userId,
          nome: nome,
          email: email,
          avatarUrl: avatarUrl,
          senha: hashedPassword,
          tipoUsuario: tipoUsuarioNovo,
          telefone: telefone,
          expoPushToken: pushToken,
        });

        const token = generateToken(userId);
        await AsyncStorage.setItem("access_token", token);
        await AsyncStorage.setItem("userId", userId);

        setIsLoading(false);

        if (tipoUsuarioNovo === "Organizador") {
          Alert.alert("Sucesso", "Cadastro do Usuário concluído com sucesso!");
          router.replace("/(routes)/login");
        } else if (tipoUsuarioNovo === "Confeiteiro") {
          Alert.alert("Sucesso", "Cadastro concluído com sucesso!");
          router.replace("/(routes)/confeitaria/cadastrar");
        }
      } catch (e) {
        setIsLoading(false);
        console.error("Erro ao completar o cadastro: ", e);
        Alert.alert("Erro", "Ocorreu um erro ao finalizar o cadastro.");
      }
    } else {
      setIsLoading(false);
      Alert.alert("Erro", "Código de confirmação incorreto.");
    }
  };

  return (
    <View style={styles.scrollContainer}>
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <>
          <Image
            source={require("../../assets/images/logo-tres.jpg")}
            style={styles.logo}
          />
          <Text style={styles.titulo}>Confirmação</Text>
          <Text style={styles.texto}>
            Agora para acabar mandamos um código para o e-mail de{" "}
            <Text style={styles.emailUsuario}>{email}</Text>. Confirme por favor
            que é você mesmo. Coloque o código abaixo.
          </Text>

          <View style={styles.codeContainer}>
            {codigo.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                style={styles.codeInput}
                maxLength={1}
                keyboardType="numeric"
                value={digit}
                onChangeText={(text) => MudandacaDoInput(text, index)}
              />
            ))}
          </View>
          
          <TouchableOpacity style={styles.loginButton} onPress={confirmarCodigo}>
            <Text style={styles.loginButtonText}>Confirmar</Text>
          </TouchableOpacity>

          <Image
            source={require("../../assets/images/jorge-2.png")}
            style={styles.jorge}
          />
        </>
      )}
    </View>
  );
}
