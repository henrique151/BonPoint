import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const iconUrl = require("../../assets/images/logo.png");

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
    icon: iconUrl,
  }),
});

// Função para registrar o dispositivo e obter o token
// async function registerForPushNotificationsAsync() {
//   const { status: existingStatus } = await Notifications.getPermissionsAsync();
//   let finalStatus = existingStatus;

//   if (existingStatus !== "granted") {
//     const { status } = await Notifications.requestPermissionsAsync();
//     finalStatus = status;
//   }

//   // Se as permissões não forem concedidas, mostra um alerta e sai da função
//   if (finalStatus !== "gr"anted") {
//     alert("Failed to get push token for push notification!");
//     return;
//   }

//   // Obtém o token do Expo para push notifications
//   const token = (await Notifications.getExpoPushTokenAsync()).data;
//   console.log("Push Notification Token:", token);

//   // Salva o token no AsyncStorage
//   await storeToken(token);
//   return token; // Retorna o token para uso posterior
// }

// Função para armazenar o token no AsyncStorage
const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("expoPushToken", token);
  } catch (error) {
    console.error("Error saving token:", error);
  }
};

const useUser = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Chama a função para registrar e obter o token
        // const token = await registerForPushNotificationsAsync(); // Muda para aguardar o token

        // Carrega o token de acesso do AsyncStorage
        const accessToken = await AsyncStorage.getItem("access_token");
        console.log("Access Token:", accessToken); // Verifique o token de acesso

        // Verifica se o token de acesso está presente
        setUser(accessToken ? "authenticated" : null);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { loading, user };
};

export default useUser;
