import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  PixelRatio,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/config/FirebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";

export default function PerfilScreen() {
  const [temConfeitaria, setTemConfeitaria] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [confeitaria, setConfeitaria] = useState<Confeitaria | null>(null);
  const [loading, setLoading] = useState(true); // Loading state

  // Function to fetch both user and confectionery data
  const consultarDados = async () => {
    setLoading(true); // Start loading
    try {
      const idUsuarioArmazenado = await AsyncStorage.getItem("userId");
      if (idUsuarioArmazenado) {
        await consultarUsuario(idUsuarioArmazenado);
        await consultarConfeitaria(idUsuarioArmazenado);
      } else {
        console.error("ID do usuário não encontrado no AsyncStorage.");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const consultarConfeitaria = async (userId: string) => {
    const confeitariaRef = doc(db, "Confeitaria", userId);
    const docSnap = await getDoc(confeitariaRef);
    setTemConfeitaria(docSnap.exists());

    if (docSnap.exists()) {
      const data = docSnap.data() as Confeitaria;
      setConfeitaria(data);
    } else {
      console.log("Confeitaria não encontrada.");
    }
  };

  const consultarUsuario = async (userId: string) => {
    const userDocRef = doc(db, "Usuario", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<User, "id">;
      setUsuario({ id: userId, ...userData });
    } else {
      console.error("Usuário não encontrado no banco de dados.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      consultarDados();
    }, [])
  );

  const navegarParaGerenciarProdutos = () => {
    if (!temConfeitaria) {
      Alert.alert(
        "Atenção",
        "Você precisa cadastrar uma confeitaria antes de gerenciar os produtos."
      );
      return;
    }
    router.push({ pathname: "/produtos/gerenciar" });
  };

  const navegarParaGerenciarPrefil = () => {
    router.push({ pathname: "/perfil/gerenciar" });
  };

  const navegarParaGerenciarConfeitaria = async () => {
    try {
      const idUsuarioArmazenado = await AsyncStorage.getItem("userId");
      if (idUsuarioArmazenado) {
        if (temConfeitaria) {
          router.push({ pathname: "/(routes)/confeitaria/gerenciar" });
        } else {
          router.push({
            pathname: "/confeitaria/cadastrar",
            params: { _idUser: idUsuarioArmazenado },
          });
        }
      } else {
        console.log("ID do usuário não encontrado no AsyncStorage.");
      }
    } catch (error) {
      console.error("Erro ao navegar para gerenciar confeitaria: ", error);
    }
  };

  const navegarParaFavorito = () => {
    router.push({ pathname: "/(routes)/favorito" });
  };

  const navegarParaReceberAvaliacao = () => {
    if (!temConfeitaria) {
      Alert.alert(
        "Atenção",
        "Você precisa cadastrar uma confeitaria para poder visualizar as avaliações recebidas."
      );
      return;
    }
    router.push({ pathname: "/(routes)/avaliacao" });
  };

  const SairDoLogin = async () => {
    try {
      // Obtém o ID do usuário armazenado localmente
      const userId = await AsyncStorage.getItem("userId");
  
      if (userId) {
        // Obtém a referência do documento do usuário no Firestore
        const userDocRef = doc(db, "Usuario", userId);
  
        // Atualiza o campo isLoggedIn para false
        await updateDoc(userDocRef, { isLoggedIn: false });
  
        // Remove os dados locais
        await AsyncStorage.removeItem("access_token");
        await AsyncStorage.removeItem("userId");
      }
  
      // Redireciona para a tela de boas-vindas
      router.replace("/bemvindo");
    } catch (error) {
      console.error("Erro ao sair: ", error);
      Alert.alert(
        "Erro",
        "Ocorreu um problema ao tentar sair do aplicativo. Tente novamente."
      );
    }
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff" }}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerColor}>
      <Header />
      <ScrollView
        style={styles.scrollview}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  usuario?.tipoUsuario === "Confeiteiro" && confeitaria
                    ? confeitaria.imagemUrl // || "https://via.placeholder.com/150"
                    : usuario?.avatarUrl, // || "https://via.placeholder.com/150",
              }}
              style={styles.largeProfileImage}
            />
          </View>

          {/* Personal Information */}
          <View style={styles.personalInfoContainer}>
            <Text style={styles.titulo}>Dados Pessoais</Text>
            <InfoItem label="Nome" value={usuario?.nome || "Nome"} />
            <InfoItem label="Email" value={usuario?.email || "Email"} />
            <InfoItem
              label="Senha"
              value={usuario?.senha || "********"}
              secureTextEntry
            />

            {/* Profile Options */}
            <View style={styles.optionsContainer}>
              {usuario?.tipoUsuario === "Confeiteiro" && (
                <>
                  <View style={styles.bordar}></View>
                  <View style={styles.iconMove}>
                    <ProfileOption
                      icon="cake-candles"
                      iconLib="FontAwesome6"
                      label="Gerenciar confeitaria"
                      onPress={navegarParaGerenciarConfeitaria}
                    />
                  </View>
                  <View style={styles.bordar}></View>
                  <ProfileOption
                    icon="ice-cream"
                    label="Gerenciar produto"
                    onPress={navegarParaGerenciarProdutos}
                  />
                  <View style={styles.bordar}></View>
                  <ProfileOption
                    icon="star"
                    label="Receber Avaliação"
                    onPress={navegarParaReceberAvaliacao}
                  />
                </>
              )}
              <View style={styles.bordar}></View>
              <ProfileOption
                icon="person"
                label="Gerenciar perfil"
                onPress={navegarParaGerenciarPrefil}
              />
              <View style={styles.bordar}></View>
              <ProfileOption
                icon="heart"
                label="Gerenciar favoritos"
                onPress={navegarParaFavorito}
              />
              <View style={styles.bordar}></View>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={SairDoLogin}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type ProfileOptionProps = {
  icon: string;
  iconLib?: string;
  label: string;
  onPress: () => void;
};

const ProfileOption: React.FC<ProfileOptionProps> = ({
  icon,
  iconLib = "Ionicons",
  label,
  onPress,
}) => (
  <TouchableOpacity style={styles.profileOption} onPress={onPress}>
    <IconSelector
      iconName={icon}
      iconLib={iconLib}
      size={30}
      color={Colors.BonPoint.Preto}
    />
    <Text style={styles.profileOptionText}>{label}</Text>
  </TouchableOpacity>
);

type IconSelectorProps = {
  iconName: string;
  iconLib?: string;
  size?: number;
  color?: string;
};

const IconSelector: React.FC<IconSelectorProps> = ({
  iconName,
  iconLib = "Ionicons",
  size = 30,
  color = "#000",
}) => {
  if (iconLib === "MaterialIcons") {
    return <MaterialIcons name={iconName as any} size={size} color={color} />;
  } else if (iconLib === "FontAwesome6") {
    return <FontAwesome6 name={iconName as any} size={size} color={color} />;
  } else {
    return <Ionicons name={iconName as any} size={size} color={color} />;
  }
};

const InfoItem = ({
  label,
  value,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  secureTextEntry?: boolean;
}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text
      style={styles.infoValue}
      numberOfLines={1} // Limita a uma linha
      ellipsizeMode="tail" // Adiciona reticências se o texto ultrapassar o limite
    >
      {secureTextEntry ? "********" : value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  containerColor: {
    backgroundColor: "#658ECE",
    height: "auto",
  },
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "#658ECE",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  profileImageContainer: {
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: "#658ECE",
  },
  largeProfileImage: {
    width: PixelRatio.getPixelSizeForLayoutSize(140),
    height: PixelRatio.getPixelSizeForLayoutSize(90),
    borderRadius: 16,
    marginHorizontal: 20,
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "white",
  },
  personalInfoContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  titulo: {
    textAlign: "center",
    fontSize: 28,
    marginBottom: 24,
    marginTop: -6,
    fontWeight: "bold",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 20,
  },
  infoValue: {
    color: "#333",
    fontSize: 20,
    flexWrap: "wrap",
    maxWidth: "78%", // Ajusta o texto ao tamanho máximo, respeitando o layout
  },
  optionsContainer: {
    marginVertical: 6,
  },
  bordar: {
    width: "110%",
    flex: 1,
    marginLeft: -17,
    borderTopWidth: 2,
    borderColor: "#658ECE",
    marginBottom: 6,
  },
  profileOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  profileOptionText: {
    marginLeft: 16,
    fontSize: 19,
  },
  iconMove: {
    marginLeft: 3,
  },
  scrollview: {
    marginBottom: 50,
    backgroundColor: "#658ECE",
    height: "auto",
  },
  logoutContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 50,
  },
  logoutButton: {
    width: 200,
    backgroundColor: "#4175C4",
    padding: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});
