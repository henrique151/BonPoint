import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { stylesAvaliacao } from "@/styles/confeitaria/confeitariaCard.styles";
import { format, toZonedTime } from "date-fns-tz";
import Colors from "@/constants/Colors";


const ConfeitariaAvaliacao: React.FC<ConfeitariaAvaliacaoProps> = ({
  idConfeitaria,
  usuario,
}) => {
  const [comentario, setComentario] = useState<string>("");
  const [avaliacao, setAvaliacao] = useState<number>(0);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [comentariosExibidos, setComentariosExibidos] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false); // Estado para carregamento
  const timeZone = "America/Sao_Paulo"; // Adjust as needed

  const carregarAvaliacoes = async () => {
    try {
      const docRef = doc(db, "Confeitaria", idConfeitaria);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const comentarios = Array.isArray(data.avaliacoes)
          ? data.avaliacoes
          : [];
        const avaliacaoList = await Promise.all(
          comentarios.map(async (item: any) => {
            const avaliacaoDoc = await getDoc(doc(db, "Avaliacao", item.id));
            if (avaliacaoDoc.exists()) {
              const avaliacaoData = avaliacaoDoc.data();
              const timestamp = avaliacaoData.timestamp; // Get timestamp

              // Validate timestamp
              if (typeof timestamp !== "number") {
                console.error(
                  `Invalid timestamp for evaluation ID ${item.id}:`,
                  timestamp
                );
                return null; // Skip invalid evaluation
              }

              // Convert to zoned time
              const zonedDate = toZonedTime(new Date(timestamp), timeZone); // Changed here

              return {
                idAvaliacao: item.id,
                comentario: avaliacaoData.comentario,
                usuarioNome: avaliacaoData.usuarioNome,
                usuarioImagem: avaliacaoData.usuarioImagem,
                usuarioId: avaliacaoData.usuarioId,
                avaliacao: avaliacaoData.avaliacao,
                timestamp: timestamp,
                zonedDate: zonedDate,
              } as Avaliacao;
            }
            return null;
          })
        );

        setAvaliacoes(
          avaliacaoList.filter((item): item is Avaliacao => item !== null)
        );
      } else {
        console.log("Nenhuma avaliação encontrada.");
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error);
    }
  };

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  const enviarAvaliacao = async () => {
    
    if (comentario.trim() === "" || avaliacao === 0) {
      alert("Por favor, preencha o comentário e a avaliação.");
      return;
    }

    setIsLoading(true); // Ativar o estado de loading

    try {
      const userDocId = usuario.id;
      const timestamp = Date.now(); // Get the current timestamp
      const avaliacaoDocId = `${userDocId}-${timestamp}`;

      await setDoc(doc(db, "Avaliacao", avaliacaoDocId), {
        idConfeitaria,
        comentario,
        avaliacao,
        usuarioNome: usuario.nome,
        usuarioEmail: usuario.email,
        usuarioImagem: usuario.avatarUrl || "",
        usuarioId: userDocId,
        idAvaliacao: avaliacaoDocId,
        timestamp, // Store the timestamp here
      });

      const confeitariaRef = doc(db, "Confeitaria", idConfeitaria);
      await updateDoc(confeitariaRef, {
        avaliacoes: [
          ...avaliacoes.map((a) => ({ id: a.idAvaliacao })),
          { id: avaliacaoDocId },
        ],
      });

      alert("Avaliação enviada com sucesso!");
      setComentario("");
      setAvaliacao(0);
      carregarAvaliacoes();
      
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      alert("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setIsLoading(false); // Desativar o estado de loading
    }
  };

  const mostrarMaisComentarios = () => {
    setComentariosExibidos((prev) => prev + 3);
  };

  const excluirComentario = async (idAvaliacao: string) => {
    setIsLoading(true); // Ativar o estado de loading
    try {
      await setDoc(doc(db, "Avaliacao", idAvaliacao), {});

      const confeitariaRef = doc(db, "Confeitaria", idConfeitaria);
      await updateDoc(confeitariaRef, {
        avaliacoes: avaliacoes
          .filter((avaliacao) => avaliacao.idAvaliacao !== idAvaliacao)
          .map((a) => ({ id: a.idAvaliacao })),
      });

      setAvaliacoes((prev) =>
        prev.filter((avaliacao) => avaliacao.idAvaliacao !== idAvaliacao)
      );

      alert("Comentário excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir comentário:", error);
      alert("Erro ao excluir comentário. Tente novamente.");
    } finally {
      setIsLoading(false); // Desativar o estado de loading
    }
  };

  return (
    <View style={stylesAvaliacao.container}>
      {isLoading && ( // Exibe a tela de loading como sobreposição
        <View style={stylesAvaliacao.loadingContainer}>
          <ActivityIndicator size="large" color="#003c8d" />
          <Text style={{fontSize: 24, color: Colors.BonPoint.Setima, fontWeight: '500'}}>Carregando...</Text>
        </View>
      )}
      <Text style={stylesAvaliacao.titulo}>Avalie a Confeitaria</Text>
      <TextInput
        style={stylesAvaliacao.input}
        placeholder="Deixe seu comentário"
        placeholderTextColor={"#000"}
        value={comentario}
        onChangeText={setComentario}
      />
      <View style={stylesAvaliacao.avaliacaoContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setAvaliacao(star)}>
            <Ionicons
              name={avaliacao >= star ? "star" : "star-outline"}
              size={32}
              color={avaliacao >= star ? "gold" : "gray"}
            />
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={stylesAvaliacao.button}
        onPress={enviarAvaliacao}
      >
        <Text style={stylesAvaliacao.buttonText}>Enviar Avaliação</Text>
      </TouchableOpacity>
      <Text style={stylesAvaliacao.tituloSegundo}>Comentários</Text>

      <ScrollView style={stylesAvaliacao.comentariosContainer}>
        {avaliacoes.slice(0, comentariosExibidos).map((item) => (
          <View key={item.idAvaliacao} style={stylesAvaliacao.comentario}>
            <View style={stylesAvaliacao.usuarioContainer}>
              {item.usuarioImagem ? (
                <Image
                  source={{ uri: item.usuarioImagem }}
                  style={stylesAvaliacao.usuarioImagem}
                />
              ) : (
                <View style={stylesAvaliacao.usuarioImagemPlaceholder} />
              )}
              <View style={stylesAvaliacao.comentarioTextoContainer}>
                <View style={stylesAvaliacao.usuarioNomeContainer}>
                  <Text style={stylesAvaliacao.usuarioNome}>
                    {item.usuarioNome}
                  </Text>
                  {item.usuarioId === usuario.id && (
                    <TouchableOpacity
                      style={stylesAvaliacao.excluirButton}
                      onPress={() => excluirComentario(item.idAvaliacao)}
                    >
                      <Ionicons name="trash" size={24} color="red" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={stylesAvaliacao.avaliacaoContainerDois}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={item.avaliacao >= star ? "star" : "star-outline"}
                      size={23}
                      color={item.avaliacao >= star ? "gold" : "gray"}
                    />
                  ))}
                </View>
                <Text style={stylesAvaliacao.dataTexto}>
                  {format(item.zonedDate, "dd/MM/yyyy HH:mm", { timeZone })}
                </Text>
                <Text style={stylesAvaliacao.comentarioTextoWrapper}>
                  <Text style={stylesAvaliacao.comentarioTexto}>
                    {item.comentario}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Check if more comments can be displayed */}
        {comentariosExibidos < avaliacoes.length && (
          <TouchableOpacity
            style={stylesAvaliacao.verMaisButton}
            onPress={mostrarMaisComentarios}
          >
            <Text style={stylesAvaliacao.verMaisText}>
              Ver Mais Comentários
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default ConfeitariaAvaliacao;
