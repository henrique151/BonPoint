import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from "react-native";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  arrayRemove,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, storage } from "@/config/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Menu, Provider } from "react-native-paper";
import { styles } from "@/styles/chat/chat.styles";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";

interface Mensagem {
  idMensagem: string;
  texto: string;
  conversaId: string;
  dataCriacao: { seconds: number };
  usuario: User;
  idUsuarioRemetente: string;
  idUsuarioDestinatario: string;
  imagensUrl: string[];
  remetenteId: string;
  usuarioLogado: string;
  excluidaPor: string;
}

const ChatScreen: React.FC<{ idConfeitaria: string }> = ({ idConfeitaria }) => {
  const route = useRoute();
  const { idUsuarioDestinatario } = route.params as {
    idUsuarioDestinatario: string;
  };
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [confeitariaDestinatario, setConfeitariaDestinatario] =
    useState<Confeitaria | null>(null);
  const [usuarioLogado, setUsuarioLogado] = useState<User | null>(null);
  const [imagensSelecionadas, setImagensSelecionadas] = useState<string[]>([]);
  const [mensagensSelecionadas, setMensagensSelecionadas] = useState<
    Mensagem[]
  >([]); // Novo estado para mensagens selecionadas
  const [mensagemConfirmacao, setMensagemConfirmacao] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const [telefoneWhatsApp, setTelefoneWhatsApp] = useState<string | null>(null);
  const [usuarioBloqueado, setUsuarioBloqueado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [mensagemDenuncia, setMensagemDenuncia] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0); // Contador de notificações enviadas
  const [sendingMessage, setSendingMessage] = useState(false); // Estado para controlar o envio da mensagem

  useEffect(() => {
    const verificarBloqueio = async () => {
      if (!usuarioLogado) return;
      try {
        const bloqueiosDoc = await getDoc(
          doc(db, "Bloqueios", usuarioLogado.id)
        );
        if (bloqueiosDoc.exists()) {
          const bloqueados = bloqueiosDoc.data().bloqueados || [];
          if (bloqueados.includes(idUsuarioDestinatario)) {
            setUsuarioBloqueado(true);
          } else {
            setUsuarioBloqueado(false);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar bloqueio:", error);
      }
    };

    verificarBloqueio();
  }, [usuarioLogado, idUsuarioDestinatario]);

  const desbloquearUsuario = async () => {
    setLoading(true); // Inicia o loader
    try {
      await updateDoc(doc(db, "Bloqueios", usuarioLogado!.id), {
        bloqueados: arrayRemove(idUsuarioDestinatario),
      });
      Alert.alert("Usuário Desbloqueado.", "Você desbloqueou este usuário.");
      setUsuarioBloqueado(false); // Atualiza o estado de bloqueio
    } catch (error) {
      console.error("Erro ao desbloquear usuário:", error);
      Alert.alert("Erro", "Não foi possível desbloquear o usuário.");
    } finally {
      setLoading(false); // Para o loader após a operação
    }
  };

  useEffect(() => {
    const carregarTelefoneWhatsApp = async () => {
      if (idUsuarioDestinatario) {
        try {
          const usuarioDoc = await getDoc(
            doc(db, "Usuario", idUsuarioDestinatario)
          );
          if (usuarioDoc.exists()) {
            const telefone = usuarioDoc.data().telefone;
            setTelefoneWhatsApp(telefone); // Armazena o telefone do usuário (confeitaria) no estado
          }
        } catch (error) {
          console.error("Erro ao buscar telefone do WhatsApp:", error);
        }
      }
    };
    carregarTelefoneWhatsApp();
  }, [idUsuarioDestinatario]);

  const abrirWhatsApp = () => {
    if (telefoneWhatsApp) {
      Linking.openURL(`https://wa.me/${telefoneWhatsApp}`);
    } else {
      Alert.alert("Erro", "Número de WhatsApp não disponível.");
    }
  };

  const bloquearUsuario = async () => {
    try {
      await setDoc(doc(db, "Bloqueios", usuarioLogado!.id), {
        bloqueados: arrayUnion(idUsuarioDestinatario),
      });
      Alert.alert("Usuário Bloqueado.", "Você bloqueou este usuário.");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao bloquear usuário:", error);
    }
  };

  const denunciarUsuario = async () => {
    if (!usuarioLogado || !mensagemDenuncia) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch("http://192.168.1.2:3000/denunciar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuarioLogado.email,
          mensagem: mensagemDenuncia,
        }),
      });

      const data = await response.text();

      if (!response.ok) {
        throw new Error(data);
      }

      Alert.alert("Sucesso", "Denúncia enviada com sucesso!");
      bloquearUsuario();
      navigation.goBack();
    } catch (error) {
      // Aqui está a alteração
      const errMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error("Erro ao enviar denúncia:", error);
      Alert.alert("Erro", `Não foi possível enviar a denúncia: ${errMessage}`);
    }
  };

  const formatarData = (timestamp: number) => {
    const data = new Date(timestamp * 1000);
    return data.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatarHora = (timestamp: number) => {
    const data = new Date(timestamp * 1000);
    return data.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
      hour12: false,
    });
  };

  const verificarNovoDia = (
    mensagemAnterior: Mensagem | undefined,
    mensagemAtual: Mensagem
  ) => {
    if (!mensagemAnterior) return true;
    const dataAnterior = new Date(mensagemAnterior.dataCriacao.seconds * 1000);
    const dataAtual = new Date(mensagemAtual.dataCriacao.seconds * 1000);
    return (
      dataAnterior.getDate() !== dataAtual.getDate() ||
      dataAnterior.getMonth() !== dataAtual.getMonth() ||
      dataAnterior.getFullYear() !== dataAtual.getFullYear()
    );
  };

  // Carregar informações do usuário logado
  useEffect(() => {
    const consultarUsuario = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const userDoc = await getDoc(doc(db, "Usuario", userId));
        if (userDoc.exists()) {
          const { id: ignoredId, ...userData } = userDoc.data();
          setUsuarioLogado({ id: userId, ...userData } as User);
        }
      }
    };
    consultarUsuario();
  }, []);

  // Carregar a confeitaria do destinatário
  useEffect(() => {
    const carregarConfeitariaDestinatario = async () => {
      const confeitariaDoc = await getDoc(
        doc(db, "Confeitaria", idUsuarioDestinatario)
      );

      if (confeitariaDoc.exists()) {
        const dadosConfeitaria = confeitariaDoc.data() as Confeitaria;

        setConfeitariaDestinatario({
          ...dadosConfeitaria,
        });

        // Check if idUsuario exists and fetch user name
        if (dadosConfeitaria.idUser) {
          const usuarioDoc = await getDoc(
            doc(db, "Usuario", dadosConfeitaria.idUser)
          );
          if (usuarioDoc.exists()) {
            setConfeitariaDestinatario(
              (prev) =>
                prev && {
                  ...prev,
                  usuarioNome:
                    usuarioDoc.data()?.nome || "Usuário desconhecido",
                }
            );
          }
        }
      }
    };
    carregarConfeitariaDestinatario();
  }, [idUsuarioDestinatario]);

  // Carregar mensagens
  useEffect(() => {
    if (!usuarioLogado || usuarioBloqueado) return;

    const conversaId = [idUsuarioDestinatario, usuarioLogado.id]
      .sort()
      .join("_");
    const mensagensRef = collection(db, "Mensagens");
    const q = query(mensagensRef, where("conversaId", "==", conversaId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mensagensData = snapshot.docs.map((doc) => ({
        idMensagem: doc.id,
        ...(doc.data() as Omit<Mensagem, "idMensagem">),
      }));

      mensagensData.sort(
        (a, b) => a.dataCriacao.seconds - b.dataCriacao.seconds
      );
      setMensagens(mensagensData); // Atualiza o estado com todas as mensagens e imagens
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });

    return () => unsubscribe();
  }, [usuarioLogado, idUsuarioDestinatario, usuarioBloqueado]);

  const enviarMensagem = async () => {
    try {
      if (!usuarioLogado || !idUsuarioDestinatario) {
        throw new Error("Usuário ou destinatário não estão definidos.");
      }
  
      if (usuarioBloqueado) {
        throw new Error("Você não pode enviar mensagens para este usuário.");
      }
  
      // Limpa o campo de mensagem imediatamente
      const textoMensagem = novaMensagem.trim();
      setNovaMensagem("");
      setImagensSelecionadas([]);
  
      if (!textoMensagem && imagensSelecionadas.length === 0) {
        throw new Error("Mensagem não pode ser vazia.");
      }
  
      const conversaId = [idUsuarioDestinatario, usuarioLogado.id].sort().join("_");
  
      const novaMensagemObj = {
        texto:
          textoMensagem ||
          (imagensSelecionadas.length > 0 ? "Imagens enviadas" : ""),
        conversaId,
        dataCriacao: { seconds: Math.floor(Date.now() / 1000) },
        usuario: usuarioLogado,
        idUsuarioRemetente: usuarioLogado.id,
        idUsuarioDestinatario,
        imagensUrl: [] as string[],
      };
  
      const enviarComDelay = async () => {
        const imagemUrls: string[] = [];
  
        // Upload de imagens (se houver)
        if (imagensSelecionadas.length > 0) {
          await Promise.all(
            imagensSelecionadas.map(async (imagemUri) => {
              const response = await fetch(imagemUri);
              const blob = await response.blob();
              const imageRef = ref(
                storage,
                `BonPoint/Mensagens/imagens/${Date.now()}_${Math.random()}.jpg`
              );
              await uploadBytes(imageRef, blob);
              const url = await getDownloadURL(imageRef);
              imagemUrls.push(url);
            })
          );
        }
  
        novaMensagemObj.imagensUrl = imagemUrls;
  
        // Salva a mensagem no Firestore
        await addDoc(collection(db, "Mensagens"), novaMensagemObj);
  
        // Rolagem automática no chat
        scrollViewRef.current?.scrollToEnd({ animated: true });
  
        // Envio de notificação (se aplicável)
        console.log(notificationCount)
        if (notificationCount < 4) {
       
          const destinatarioDoc = await getDoc(
            doc(db, "Usuario", idUsuarioDestinatario)
          );
          if (destinatarioDoc.exists()) {
            const tokenDestinatario = destinatarioDoc.data()?.expoPushToken;
            if (tokenDestinatario) {
              await fetch("http://192.168.1.2:3000/send-notification", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  token: tokenDestinatario,
                  title: "Nova mensagem.",
                  body: `${usuarioLogado.nome}: ${novaMensagemObj.texto}`,
                }),
              });
              setNotificationCount((prevCount) => prevCount + 1);
            }
          }
        }
      };
  
      // Aguarda 2 segundos antes de processar o envio
      setTimeout(() => {
        enviarComDelay().catch((error) => {
        
        });
      }, 500);
    } catch (error) {

    }
  };
  
  
  // Função para escolher várias imagens
  const escolherImagens = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const novasImagens = result.assets.map((asset) => asset.uri); // Mapeia os URIs das imagens selecionadas
      setImagensSelecionadas((prev) => [...prev, ...novasImagens]); // Adiciona as novas imagens ao estado
    }
  };

  const toggleMensagemSelecionada = (mensagem: Mensagem) => {
    setMensagensSelecionadas((prevSelecionadas) => {
      if (prevSelecionadas.includes(mensagem)) {
        return prevSelecionadas.filter(
          (msg) => msg.idMensagem !== mensagem.idMensagem
        );
      } else {
        return [...prevSelecionadas, mensagem];
      }
    });
  };

  const excluirMensagensSelecionadas = async () => {
    if (mensagensSelecionadas.length === 0) {
      Alert.alert(
        "Nenhuma mensagem selecionada",
        "Por favor, selecione uma mensagem para excluir."
      );
      return;
    }

    Alert.alert(
      "Confirmar exclusão",
      "Você deseja excluir as mensagens selecionadas permanentemente ou apenas para você?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir para Todos",
          onPress: async () => {
            const promises = mensagensSelecionadas.map(async (mensagem) => {
              const mensagemRef = doc(db, "Mensagens", mensagem.idMensagem);
              // Exclui a mensagem completamente do banco de dados
              await deleteDoc(mensagemRef);
            });

            try {
              await Promise.all(promises);
              setMensagensSelecionadas([]);
              setMensagemConfirmacao("Mensagens excluídas para todos!");
              setTimeout(() => {
                setMensagemConfirmacao("");
              }, 3000);
            } catch (error) {
              console.error("Erro ao excluir mensagens:", error);
              setMensagemConfirmacao("Erro ao excluir mensagens");

              // Limpa a mensagem após 3 segundos
              setTimeout(() => {
                setMensagemConfirmacao("");
              }, 3000);
            }
          },
        },
        {
          text: "Excluir Apenas Para Mim",
          onPress: async () => {
            const promises = mensagensSelecionadas.map(async (mensagem) => {
              const mensagemRef = doc(db, "Mensagens", mensagem.idMensagem);
              // Marca a mensagem como excluída para este usuário
              await updateDoc(mensagemRef, {
                excluidaPor: arrayUnion(usuarioLogado.id),
              });
            });

            try {
              await Promise.all(promises);
              setMensagensSelecionadas([]);
              setMensagemConfirmacao("Mensagens excluídas apenas para você!");
              setTimeout(() => {
                setMensagemConfirmacao("");
              }, 3000);
            } catch (error) {
              console.error("Erro ao excluir mensagens:", error);
              setMensagemConfirmacao("Erro ao excluir mensagens");

              // Limpa a mensagem após 3 segundos
              setTimeout(() => {
                setMensagemConfirmacao("");
              }, 3000);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <Provider>
      {/* Loader global */}
      {loading && (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      )}
      <View style={styles.container}>
        {/* Verifica se o usuário está bloqueado */}
        {usuarioBloqueado ? (
          <View style={styles.blockedUserContainer}>
            <Text style={styles.blockedUserText}>
              Você bloqueou este usuário. Você não pode enviar mensagens.
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Voltar à Página Inicial</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={desbloquearUsuario}>
              <Text style={styles.unlockText}>
                Se você quiser desbloquear, clique aqui
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Header com ícone de voltar e informações da confeitaria */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backIcon}
              >
                <View style={styles.icon}>
                  <Ionicons name="arrow-back" size={32} color="white" />
                </View>
              </TouchableOpacity>
              <View style={styles.confeitariaInfo}>
                {confeitariaDestinatario ? (
                  // Se o destinatário tiver uma confeitaria
                  <>
                    {confeitariaDestinatario.imagemUrl && (
                      <Image
                        source={{ uri: confeitariaDestinatario.imagemUrl }}
                        style={styles.confeitariaImage}
                      />
                    )}
                    <View>
                      <Text style={styles.confeitariaName}>
                        {confeitariaDestinatario.nome}
                      </Text>
                      <Text style={styles.usuarioName}>
                        {confeitariaDestinatario.usuarioNome}
                      </Text>
                    </View>
                  </>
                ) : (
                  // Se não houver confeitaria, mostra a imagem de perfil e nome do usuário
                  <>
                    <Image
                      source={{ uri: usuarioLogado?.avatarUrl }} // Supondo que você tenha o objeto usuarioLogado
                      style={styles.confeitariaImage}
                    />
                    <View>
                      <Text style={styles.confeitariaName}>
                        {usuarioLogado?.nome} {/* Nome do usuário logado */}
                      </Text>
                      <Text style={styles.usuarioNameEvento}>
                        Org. de Eventos {/* Abreviação para reduzir o espaço */}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              <View style={styles.menuContainer}>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  style={styles.menu}
                  anchor={
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                      <Ionicons
                        name="ellipsis-vertical"
                        size={24}
                        color="white"
                      />
                    </TouchableOpacity>
                  }
                >
                  <View style={styles.menuItems}>
                    <Menu.Item onPress={bloquearUsuario} title="Bloquear" />
                    <Menu.Item onPress={abrirWhatsApp} title="WhatsApp" />
                    <Menu.Item
                      onPress={() => setModalVisible(true)}
                      title="Denunciar"
                    />
                  </View>
                </Menu>
              </View>
            </View>

            {/* Lista de mensagens */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              onContentSizeChange={() =>
                scrollViewRef.current?.scrollToEnd({ animated: true })
              }
            >
              {mensagens.map((mensagem, index) => {
                const isUsuarioLogado =
                  mensagem.usuario.id === usuarioLogado?.id;
                const mensagemAnterior = mensagens[index - 1];
                const mostrarData = verificarNovoDia(
                  mensagemAnterior,
                  mensagem
                );
                const isSelected = mensagensSelecionadas.includes(mensagem);

                if (
                  mensagem.excluidaPor &&
                  mensagem.excluidaPor.includes(usuarioLogado.id)
                ) {
                  return null; // Não renderiza a mensagem se estiver excluída para o usuário
                }
                // Verifica se a mensagem está selecionada

                return (
                  <View key={mensagem.idMensagem}>
                    {mostrarData && (
                      <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>
                          {formatarData(mensagem.dataCriacao.seconds)}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      onPress={() => toggleMensagemSelecionada(mensagem)} // Marcar/Desmarcar a mensagem
                      style={[
                        styles.messageContainer,
                        {
                          flexDirection: isUsuarioLogado
                            ? "row-reverse"
                            : "row",
                        },
                        isSelected && styles.selectedMessage,
                      ]}
                    >
                      <Image
                        source={{
                          uri:
                            mensagem.usuario?.avatarUrl ||
                            "https://via.placeholder.com/40",
                        }}
                        style={styles.avatar}
                      />
                      <View
                        style={[
                          styles.bubble,
                          {
                            backgroundColor: isUsuarioLogado
                              ? "#DCF8C6"
                              : "#EAEAEA",
                          },
                        ]}
                      >
                        {mensagem.imagensUrl &&
                        mensagem.imagensUrl.length > 0 ? (
                          <>
                            {mensagem.imagensUrl.map((imagemUrl, index) => (
                              <Image
                                key={index}
                                source={{ uri: imagemUrl }}
                                style={styles.imageMessage}
                              />
                            ))}
                            {mensagem.texto &&
                              mensagem.texto !== "Imagens enviadas" && (
                                <Text style={styles.messageText}>
                                  {mensagem.texto}
                                </Text>
                              )}
                          </>
                        ) : (
                          <Text>{mensagem.texto}</Text>
                        )}
                        <Text style={styles.timeText}>
                          {formatarHora(mensagem.dataCriacao.seconds)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>

            {/* Renderizar as imagens selecionadas acima da barra de entrada */}
            <View style={styles.containerImagem}>
              {imagensSelecionadas.length > 0 && (
                <View style={styles.selectedImagesContainer}>
                  {imagensSelecionadas.map((imagemUri, index) => (
                    <Image
                      key={index}
                      source={{ uri: imagemUri }}
                      style={styles.selectedImage}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Área de entrada de mensagem */}
            <View style={styles.inputContainer}>
              {/* Exibir ícone de lixeira se houver mensagens selecionadas */}
              {mensagensSelecionadas.length > 0 && (
                <TouchableOpacity onPress={excluirMensagensSelecionadas}>
                  <Ionicons
                    name="trash"
                    size={30}
                    color="red"
                    style={styles.trashIcon}
                  />
                </TouchableOpacity>
              )}

              <Ionicons
                name="image"
                size={30}
                color="white"
                onPress={escolherImagens}
                style={styles.imageIcon}
              />
              <TextInput
                style={styles.input}
                value={novaMensagem}
                onChangeText={setNovaMensagem}
                placeholder="Escreva uma mensagem..."
                placeholderTextColor="#FFF"
              />
              <TouchableOpacity
                onPress={enviarMensagem}
                disabled={sendingMessage}
              >
                <Ionicons
                  name="send"
                  size={30}
                  color="white"
                  style={styles.sendIcon}
                />
              </TouchableOpacity>
            </View>
          </>
        )}
        {/* Modal de Denúncia */}
        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <SafeAreaView style={styles.modalContainer}>
              <TouchableOpacity
                style={styles.backButtonDois}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="arrow-back" size={30} color="#fff" />
                {/* Ícone de seta */}
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Enviar Denúncia</Text>
              <TextInput
                style={styles.modalInput}
                value={mensagemDenuncia}
                onChangeText={setMensagemDenuncia}
                placeholder="Digite sua mensagem de denúncia..."
                placeholderTextColor="#fff"
                multiline
              />
              <TouchableOpacity
                style={styles.button}
                onPress={denunciarUsuario}
              >
                <Text style={styles.buttonText}>Enviar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelarButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Modal>
        </View>
      </View>
    </Provider>
  );
};

export default ChatScreen;
