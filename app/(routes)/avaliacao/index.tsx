import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "@/config/FirebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, toZonedTime } from "date-fns-tz";
import Header from "@/components/header/header";
import Colors from "@/constants/Colors";
import { useNavigation, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Ionicons key={i} name="star" size={28} color="gold" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(<Ionicons key={i} name="star-half" size={28} color="gold" />);
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={28} color="gold" />
      );
    }
  }

  return <View style={styles.starsContainer}>{stars}</View>;
};

export default function AvaliacaoScreen() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [confeitaria, setConfeitaria] = useState<Confeitaria | null>(null);
  const [usuarioNome, setUsuarioNome] = useState<string>("");
  const [usuarioImagem, setUsuarioImagem] = useState<string>("");
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    const consultarUsuario = async () => {
      try {
        const idUsuarioArmazenado = await AsyncStorage.getItem("userId");
        if (idUsuarioArmazenado) {
          const userDocRef = doc(db, "Usuario", idUsuarioArmazenado);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const idUser = userData?.id;
            setUsuarioNome(userData?.nome || "");
            setUsuarioImagem(userData?.avatarUrl || "");

            const confeitariaRef = collection(db, "Confeitaria");
            const q = query(confeitariaRef, where("idUser", "==", idUser));
            const confeitariaSnapshot = await getDocs(q);

            if (!confeitariaSnapshot.empty) {
              const confeitariaDoc = confeitariaSnapshot.docs[0];
              const confeitariaData = confeitariaDoc.data() as Omit<
                Confeitaria,
                "idConfeitaria"
              >;
              setConfeitaria({
                idConfeitaria: confeitariaDoc.id,
                ...confeitariaData,
              });
              buscarAvaliacoes(confeitariaDoc.id);
            } else {
              console.warn("Usuário não tem uma confeitaria associada.");
            }
          } else {
            console.error("Usuário não encontrado no banco de dados.");
          }
        } else {
          console.error("ID do usuário não encontrado no AsyncStorage.");
        }
      } catch (error) {
        console.error("Erro ao consultar usuário:", error);
      }
    };

    const buscarAvaliacoes = async (idConfeitaria: string) => {
      try {
        const avaliacoesRef = collection(db, "Avaliacao");
        const q = query(
          avaliacoesRef,
          where("idConfeitaria", "==", idConfeitaria)
        );
        const querySnapshot = await getDocs(q);
        const listaAvaliacoes: Avaliacao[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Avaliacao, "idAvaliacao">;
          listaAvaliacoes.push({ idAvaliacao: doc.id, ...data });
        });
        setAvaliacoes(listaAvaliacoes);
      } catch (error) {
        console.error("Erro ao buscar avaliações: ", error);
      }
    };

    consultarUsuario();
  }, []);

  const renderAvaliacao = ({ item }: { item: Avaliacao }) => {
    let formattedDate = "Data indisponível";
    const timeZone = "America/Sao_Paulo";

    if (item.timestamp && typeof item.timestamp === "number") {
      try {
        const zonedDate = toZonedTime(new Date(item.timestamp), timeZone);
        formattedDate = format(zonedDate, "dd/MM/yyyy HH:mm", { timeZone });
      } catch (error) {
        console.error("Erro ao formatar a data:", error);
      }
    }

    return (
      <View style={styles.avaliacaoContainer}>
        <View style={styles.usuarioContainer}>
          <Image
            source={{ uri: item.usuarioImagem }}
            style={styles.imagemPerfil}
          />
          <View style={styles.usuarioInfo}>
            <Text style={styles.usuarioNome}>{item.usuarioNome}</Text>
            <Text style={styles.comentario}>{item.comentario}</Text>
            <View style={styles.ratingDateContainer}>
              <StarRating rating={item.avaliacao} />
              <Text style={styles.dataTexto}>{formattedDate}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.containerUm}>
      <Header />

      <View style={styles.container}>
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
        <View style={styles.backgroundo}>
          <Text style={styles.tituloUm}>
            Confira as avaliações sobre a confeitaria!
          </Text>

          <Text style={styles.tituloDois}>
            A opinião do nosso público é essencial para a confeitaria!
          </Text>
          <FlatList
            data={avaliacoes}
            renderItem={renderAvaliacao}
            keyExtractor={(item) => item.idAvaliacao}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  containerUm: {
    flex: 1,
  },
  avaliacaoContainer: {
    marginTop: 6,
    borderTopWidth: 1,
    padding: 16,
    borderRadius: 10,
    borderColor: "#000",
  },
  backgroundo: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#f7f6fb",
  },
  tituloUm: {
    fontSize: 20,
    alignItems: "center",
    textAlign: "center",
    marginTop: 16,
  },
  tituloDois: {
    textAlign: "center",
    fontSize: 20,
    color: Colors.BonPoint.Cinza_4,
    padding: 13,
    marginTop: -3,
  },
  usuarioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imagemPerfil: {
    width: 70,
    height: 70,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.BonPoint.Branco,
    marginRight: 8,
  },
  usuarioInfo: {
    flex: 1,
  },
  usuarioNome: {
    fontWeight: "bold",
    fontSize: 18,
  },
  comentario: {
    marginVertical: 4,
    color: Colors.BonPoint.Cinza_4,
    fontStyle: "italic",
    fontSize: 18,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 16,
    color: Colors.BonPoint.Branco,
  },
  dataTexto: {
    fontSize: 15,
    color: "#555",
  },
  ratingDateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
  },
  noConfeitariaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  cadastrarButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.BonPoint.Primaria,
  },
  cadastrarButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    position: "absolute", // Posiciona o botão de volta dentro do contêiner
    top: 95, // Ajuste a posição vertical para ficar alinhado ao topo
    left: 20, // Ajuste a posição horizontal para o canto esquerdo
    backgroundColor: Colors.BonPoint.Primaria,
    width: 40,
    height: 40,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Garante que o botão esteja acima da imagem
  },
  backButtonText: {
    fontSize: 30,
    color: Colors.BonPoint.Branco,
  },
});
