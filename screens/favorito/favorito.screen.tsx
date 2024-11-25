import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";

const FavoritoScreen: React.FC = () => {
  const [favoritas, setFavoritas] = useState<Confeitaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingConfeitaria, setLoadingConfeitaria] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const buscarFavoritas = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (userId) {
          const usuarioRef = collection(db, "Usuario");
          const q = query(usuarioRef, where("id", "==", userId));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const usuarioData = docSnap.data() as User;
            setUsuario(usuarioData);

            if (usuarioData.favoritos && usuarioData.favoritos.length > 0) {
              const confeitariaRef = collection(db, "Confeitaria");
              const q = query(
                confeitariaRef,
                where("idConfeitaria", "in", usuarioData.favoritos)
              );
              const querySnapshot = await getDocs(q);
              const favoritasData: Confeitaria[] = [];
              querySnapshot.forEach((doc) => {
                favoritasData.push(doc.data() as Confeitaria);
              });
              setFavoritas(favoritasData);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar confeitarias favoritas:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarFavoritas();
  }, []);

  const abrirConfeitaria = async (idConfeitaria: string) => {
    setLoadingConfeitaria(true); // Ativa o carregamento da confeitaria
    await router.push({
      pathname: "/confeitaria/[idConfeitaria]", // Define o caminho da rota dinamicamente
      params: { idConfeitaria }, // Passa o parâmetro
    });
    setLoadingConfeitaria(false); // Desativa o carregamento após a navegação
  };

  const alternarFavorito = async (idConfeitaria: string) => {
    if (!usuario) return;

    try {
      const usuarioRef = doc(db, "Usuario", usuario.id); // Documento do usuário
      const confeitariaJaFavorita = usuario.favoritos.includes(idConfeitaria);

      if (confeitariaJaFavorita) {
        // Remover dos favoritos
        await updateDoc(usuarioRef, {
          favoritos: arrayRemove(idConfeitaria),
        });
        setFavoritas(
          favoritas.filter((fav) => fav.idConfeitaria !== idConfeitaria)
        ); // Remove da lista local
      } else {
        // Adicionar aos favoritos
        await updateDoc(usuarioRef, {
          favoritos: arrayUnion(idConfeitaria),
        });
      }

      // Atualiza a lista de favoritos
      const novosFavoritos = confeitariaJaFavorita
        ? usuario.favoritos.filter((id) => id !== idConfeitaria)
        : [...usuario.favoritos, idConfeitaria];

      setUsuario({ ...usuario, favoritos: novosFavoritos });
    } catch (error) {
      console.error("Erro ao adicionar/remover favorito:", error);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.BonPoint.Tercerio,
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{fontSize: 18, color: "#Fff"}}>Carregando favoritos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.containerDois}>
      <Header />
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
      <View style={styles.backGround}>
        <Text style={styles.titulo}>Confeitarias Favoritas</Text>
        <Text style={styles.subtitulo}>
          Aqui estão as suas confeitarias favoritas marcadas.
        </Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {loadingConfeitaria && ( // Exibe o carregamento da confeitaria quando está sendo aberta
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Abrindo confeitaria...</Text>
          </View>
        )}

        {favoritas.map((confeitaria) => (
          <View key={confeitaria.idConfeitaria} style={styles.confeitariaItem}>
            <TouchableOpacity
              onPress={() => abrirConfeitaria(confeitaria.idConfeitaria)}
              style={{ flexDirection: "row", flex: 1 }}
            >
              <Image
                source={{ uri: confeitaria.imagemUrl }}
                style={styles.confeitariaImage}
              />
              <View style={styles.textContainer}>
                <Text style={styles.confeitariaNome}>{confeitaria.nome}</Text>
                <Text style={styles.confeitariaEndereco}>
                  {confeitaria.endereco}
                </Text>
                <Text style={styles.confeitariaCidade}>
                  {confeitaria.cidade}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Coração para marcar como favorito */}
            <TouchableOpacity
              onPress={() => alternarFavorito(confeitaria.idConfeitaria)}
            >
              <AntDesign
                name={
                  usuario?.favoritos.includes(confeitaria.idConfeitaria)
                    ? "heart"
                    : "hearto"
                }
                size={24}
                color="red"
                style={styles.heartIcon}
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default FavoritoScreen;

const styles = StyleSheet.create({
  backGround: {
    padding: 16,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  containerDois: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 200,
    marginTop: 20,
  },
  titulo: {
    fontSize: 28,
    color: Colors.BonPoint.Branco,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitulo: {
    fontSize: 22,
    color: Colors.BonPoint.Branco_2,
    textAlign: "center",
    marginBottom: 12,
  },
  confeitariaItem: {
    flexDirection: "row",
    marginBottom: 16,
    backgroundColor: Colors.BonPoint.Segundaria,
    padding: 10,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "space-between", // Espaço entre o texto e o coração
  },
  confeitariaImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  textContainer: {
    flex: 1, // Permite que o contêiner de texto ocupe o espaço restante
  },
  confeitariaNome: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#Fff",
  },
  confeitariaEndereco: {
    color: Colors.BonPoint.Branco_2,
    fontSize: 18,
  },
  confeitariaCidade: {
    color: Colors.BonPoint.Branco_2,
    fontSize: 18,
  },
  heartIcon: {
    marginLeft: 10,
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
    top: 112,
    alignItems: "center",
    justifyContent: "center",
    left: 15,
    zIndex: 100001,
  },
});
