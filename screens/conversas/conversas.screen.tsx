import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { db } from "@/config/FirebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  setDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import Header from "@/components/header/header";

import Colors from "@/constants/Colors";

const HistoricoConversas = () => {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Carregar o usuário logado
  useEffect(() => {
    const carregarUsuarioLogado = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const dadosUsuario = await buscarDadosUsuario(userId);
        setUsuarioLogado({ id: userId, ...dadosUsuario });
      }
      setLoading(false);
    };
    carregarUsuarioLogado();
  }, []);

  // Função para buscar os dados do usuário
  const buscarDadosUsuario = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "Usuario", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          nome: userData?.nome || `Usuário ${userId}`,
          email: userData?.email || "", // Garantindo que email está presente
          avatarUrl: userData?.avatarUrl || "https://via.placeholder.com/50",
          senha: userData?.senha || "", // Garantindo que senha está presente
          tipoUsuario: userData?.tipoUsuario || "",
          telefone: userData?.telefone || "",
          favoritos: userData?.favoritos || [],
          dataCriacao: userData?.dataCriacao || "",
        };
      } else {
        return {
          nome: `Usuário ${userId}`,
          email: "", // Valor padrão para email
          avatarUrl: "https://via.placeholder.com/50",
          senha: "", // Valor padrão para senha
          tipoUsuario: "",
          telefone: "",
          favoritos: [],
          dataCriacao: "",
        };
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      return {
        nome: `Usuário ${userId}`,
        email: "", // Valor padrão para email
        avatarUrl: "https://via.placeholder.com/50",
        senha: "", // Valor padrão para senha
        tipoUsuario: "",
        telefone: "",
        favoritos: [],
        dataCriacao: "",
      };
    }
  };

  // Função para buscar os dados da confeitaria
  const buscarDadosConfeitaria = async (idUsuario: string) => {
    try {
      const confeitariaDoc = await getDoc(doc(db, "Confeitaria", idUsuario));
      if (confeitariaDoc.exists()) {
        const confeitariaData = confeitariaDoc.data();
        return {
          nome: confeitariaData.nome || "Organizador de Eventos",
          imagemUrl:
            confeitariaData.imagemUrl || "https://via.placeholder.com/50",
        };
      }
      return { nome: "Organizador de Eventos", imagemUrl: "" };
    } catch (error) {
      console.error("Erro ao buscar dados da confeitaria:", error);
      return { nome: "Organizador de Eventos", imagemUrl: "" };
    }
  };

  // Função para buscar as conversas
  const buscarConversas = () => {
    if (!usuarioLogado) return;

    const conversasRef = collection(db, "Mensagens");

    // Consultas para buscar mensagens onde o usuário é o destinatário ou remetente
    const qRemetente = query(
      conversasRef,
      where("idUsuarioRemetente", "==", usuarioLogado.id)
    );
    const qDestinatario = query(
      conversasRef,
      where("idUsuarioDestinatario", "==", usuarioLogado.id)
    );

    const processarSnapshot = async (snapshot: any) => {
      const novasMensagens: Map<string, Mensagem> = new Map(); // Armazena as mensagens mais recentes por contato
      const contatosMap = new Map<string, Contato>(); // Armazena as informações de cada contato

      for (const docSnapshot of snapshot.docs) {
        const mensagem = docSnapshot.data() as Mensagem;
        const idContato =
          mensagem.idUsuarioRemetente === usuarioLogado!.id
            ? mensagem.idUsuarioDestinatario // Se o usuário logado é o remetente, o contato é o destinatário
            : mensagem.idUsuarioRemetente; // Se o usuário logado é o destinatário, o contato é o remetente

        // Buscar dados do contato (nome e imagem)
        if (!contatosMap.has(idContato)) {
          const dadosContato = await buscarDadosUsuario(idContato);
          const dadosConfeitaria = await buscarDadosConfeitaria(idContato); // Buscar dados da confeitaria
          contatosMap.set(idContato, {
            id: idContato,
            nome: dadosContato.nome,
            imagemUrl:
              dadosContato.avatarUrl || "https://via.placeholder.com/50", // Usando avatarUrl
            ultimaMensagem: "", // Inicialmente sem última mensagem
            nomeConfeitaria: dadosConfeitaria.nome || "Organizador de Eventos", // Armazenar o nome da confeitaria
          });
        }

        // Verifica se a mensagem é mais recente do que a última armazenada
        if (
          !novasMensagens.has(idContato) ||
          novasMensagens.get(idContato)!.dataCriacao.seconds <
            mensagem.dataCriacao.seconds
        ) {
          novasMensagens.set(idContato, mensagem); // Atualiza com a mensagem mais recente
        }
      }

      // Atualiza as mensagens nos contatos
      for (const [idContato, mensagem] of novasMensagens) {
        const contato = contatosMap.get(idContato);
        if (contato) {
          const nomeRemetente =
            mensagem.idUsuarioRemetente === usuarioLogado!.id
              ? "Você"
              : contato.nome;
          contato.ultimaMensagem = `${nomeRemetente}: ${mensagem.texto}`; // Exibe o nome e a última mensagem
        }
      }

      setContatos(Array.from(contatosMap.values()));
      setLoading(false);
    };

    // Unir resultados de remetente e destinatário
    const unsubscribeRemetente = onSnapshot(qRemetente, (snapshot) => {
      processarSnapshot(snapshot);
    });

    const unsubscribeDestinatario = onSnapshot(qDestinatario, (snapshot) => {
      processarSnapshot(snapshot);
    });

    return () => {
      unsubscribeRemetente();
      unsubscribeDestinatario();
    };
  };

  useEffect(() => {
    if (usuarioLogado) {
      buscarConversas(); // Buscar conversas quando o usuário estiver carregado
    }
  }, [usuarioLogado]);

  const excluirConversa = async (idContato: string) => {
    try {
      // Referência à coleção de mensagens
      const conversasRef = collection(db, "Mensagens");

      // Cria uma consulta para buscar as mensagens do contato
      const q = query(
        conversasRef,
        where("idUsuarioRemetente", "==", usuarioLogado!.id),
        where("idUsuarioDestinatario", "==", idContato)
      );

      // Obtem as mensagens relacionadas ao contato
      const querySnapshot = await getDocs(q);

      // Exclui cada mensagem
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Confirma as alterações
      await batch.commit();

      // Atualiza o estado local para remover o contato
      setContatos((prevContatos) =>
        prevContatos.filter((contato) => contato.id !== idContato)
      );

      Alert.alert("Sucesso", "Conversa excluída com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      Alert.alert(
        "Erro",
        "Não foi possível excluir a conversa. Tente novamente."
      );
    }
  };

  const navegarParaChat = (idContato: string) => {
    router.push({
      pathname: "/(routes)/chat",
      params: {
        idConfeitaria: usuarioLogado?.id || "", // ID do usuário logado
        idUsuarioDestinatario: idContato, // ID do contato
      },
    });
  };

  const excluirParaChat = (idContato: string) => {
    Alert.alert(
      "Excluir Conversa",
      "Você tem certeza que deseja excluir esta conversa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => excluirConversa(idContato), // Chama a função de exclusão se o usuário confirmar
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }: { item: Contato }) => (
    
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        backgroundColor: "#a5c5fd",
        marginBottom: 12,
        borderRadius: 20,
      }}
    >
     
      <TouchableOpacity
        onPress={() => navegarParaChat(item.id)}
        style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 99,
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          <Image
            source={{ uri: item.imagemUrl }}
            style={{ width: 60, height: 60, borderRadius: 99 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 18,
              color: Colors.BonPoint.Branco,
            }}
          >
            {item.nomeConfeitaria}
          </Text>
          {item.nomeConfeitaria ? (
            <Text
              style={{
                color: Colors.BonPoint.Oitava,
                fontSize: 17,
                fontWeight: "condensed",
              }}
            >
              {item.nome}
            </Text>
          ) : null}
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: "gray", fontSize: 17 }}
          >
        {item.ultimaMensagem || "Nenhuma mensagem enviada ainda"}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => excluirParaChat(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

 if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: "#fff" }}>Carregando historico...</Text>
      </View>
    );
  }

  return (
    <View>
      <Header />
      <Text style={styles.titulo}>Histórico de Conversas</Text>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={{ marginVertical: 20 }}
          />
        ) : (
          
          <FlatList
            data={contatos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <Text style={{ textAlign: "center", margin: 20, color: '#Fff' }}>
                Você ainda não possui conversas.
              </Text>
            }
          />
        )}
       
      </View>
    </View>
  );
};

export default HistoricoConversas;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginHorizontal: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  titulo: {
    fontSize: 28,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '900',
    marginVertical: 12
  }
});
