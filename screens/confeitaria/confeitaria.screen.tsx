import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConfeitariaProduto from "@/components/confeitaria/confeitaria.produto";
import Button from "@/components/botao/button";
import { styles } from "@/styles/confeitaria/confeitaria.styles";
import Colors from "@/constants/Colors";
import { router, useNavigation } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import ConfeitariaAvaliacao from "@/components/confeitaria/confeitaria.avaliacao";
import Ionicons from "@expo/vector-icons/Ionicons";
import Header from "@/components/header/header";
import {
  stylesAvaliacao,
  stylesCard,
  stylesPrinciapl,
  stylesProduto,
} from "@/styles/confeitaria/confeitariaCard.styles";

// Componente para exibir a média de estrelas
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<Ionicons key={i} name="star" size={32} color="#fffc00" />);
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <Ionicons key={i} name="star-half" size={32} color="#fffc00" />
      );
    } else {
      stars.push(
        <Ionicons key={i} name="star-outline" size={32} color="#fffc00" />
      );
    }
  }

  return <View style={{ flexDirection: "row" }}>{stars}</View>;
};

const ConfeitariaScreen: React.FC<{ idConfeitaria: string }> = ({
  idConfeitaria,
}) => {
  const [confeitaria, setConfeitaria] = useState<Confeitaria | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [mediaEstrelas, setMediaEstrelas] = useState<number | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [usuario, setUsuario] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Loading state
  const navigation = useNavigation();

  const visualizarProduto = (idProduto: string) => {
    router.push({
      pathname: "/(routes)/produtos/visualizar",
      params: { idProduto },
    });
  };

  useEffect(() => {
    const consultarUsuario = async () => {
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

            // Verifica se a confeitaria atual já está nos favoritos
            if (usuarioData.favoritos?.includes(idConfeitaria)) {
              setIsFavorited(true);
            } else {
              setIsFavorited(false);
            }
          } else {
            console.log("Usuário não encontrado!");
          }
        } else {
          console.log("Nenhum userId encontrado no AsyncStorage.");
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
      }
    };

    consultarUsuario();
  }, [idConfeitaria]);

  useEffect(() => {
    consultarConfeitaria();
  }, [idConfeitaria]);

  const consultarConfeitaria = async () => {
    setLoading(true); // Start loading
    try {
      if (idConfeitaria) {
        const confeitariaRef = collection(db, "Confeitaria");
        const q = query(
          confeitariaRef,
          where("idConfeitaria", "==", idConfeitaria)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          const data = docSnap.data() as Confeitaria;
          setConfeitaria(data);
          await consultarProdutos(data.produtos || []);
          await consultarCategorias(data.categoria || []);
          const unsubscribe = consultarAvaliacoes(data.idConfeitaria);
          return () => unsubscribe(); // Limpa o listener
        } else {
          console.log("Documento com idConfeitaria não encontrado!");
        }
      } else {
        console.log("ID da Confeitaria não fornecido.");
      }
    } catch (error) {
      console.error("Erro ao buscar documento:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  const consultarProdutos = async (produtosIds: string[]) => {
    try {
      if (produtosIds.length === 0) {
        setProdutos([]);
        return;
      }

      const produtosRef = collection(db, "Produto");
      const q = query(produtosRef, where("idProduto", "in", produtosIds));
      const querySnapshot = await getDocs(q);
      const produtosData: Produto[] = [];
      querySnapshot.forEach((doc) => {
        produtosData.push(doc.data() as Produto);
      });
      setProdutos(produtosData);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const consultarCategorias = async (categoriasIds: string[]) => {
    try {
      if (categoriasIds.length === 0) {
        setCategorias([]);
        return;
      }

      const categoriasRef = collection(db, "Categoria");
      const q = query(categoriasRef, where("id", "in", categoriasIds));
      const querySnapshot = await getDocs(q);
      const categoriasData: Categoria[] = [];
      querySnapshot.forEach((doc) => {
        categoriasData.push(doc.data() as Categoria);
      });
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  // Função para consultar avaliações
  const consultarAvaliacoes = (idConfeitaria: string) => {
    const avaliacoesRef = collection(db, "Avaliacao");
    const q = query(avaliacoesRef, where("idConfeitaria", "==", idConfeitaria));

    // Usando onSnapshot para escutar alterações em tempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const avaliacoesData: Avaliacao[] = [];
      querySnapshot.forEach((doc) => {
        avaliacoesData.push(doc.data() as Avaliacao);
      });
      setAvaliacoes(avaliacoesData);
      calcularMediaEstrelas(avaliacoesData); // Atualiza a média ao receber novas avaliações
    });

    return unsubscribe; // Retorna a função unsubscribe
  };

  // Função para calcular a média de estrelas
  const calcularMediaEstrelas = (avaliacoes: Avaliacao[]) => {
    if (avaliacoes.length === 0) {
      setMediaEstrelas(null);
      return;
    }
    const totalEstrelas = avaliacoes.reduce(
      (acc, avaliacao) => acc + avaliacao.avaliacao,
      0
    );
    const media = totalEstrelas / avaliacoes.length;
    setMediaEstrelas(media);
  };

  const adicionarFavorito = async () => {
    if (!usuario || !confeitaria) return;

    try {
      const usuarioRef = doc(db, "Usuario", usuario.id); // Documento do usuário

      if (isFavorited) {
        // Remover dos favoritos
        await updateDoc(usuarioRef, {
          favoritos: arrayRemove(confeitaria.idConfeitaria),
        });
      } else {
        // Adicionar aos favoritos
        await updateDoc(usuarioRef, {
          favoritos: arrayUnion(confeitaria.idConfeitaria),
        });
      }

      setIsFavorited(!isFavorited); // Alterna o estado do favorito
    } catch (error) {
      console.error("Erro ao adicionar/remover favorito:", error);
    }
  };

  // Se ainda está carregando, exibe o loader
  if (loading) {
    return (
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          backgroundColor: Colors.BonPoint.Primaria,
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 10, color: "#fff" }}>
          Carregando dados...
        </Text>
      </View>
    );
  }

  if (!confeitaria) {
    return (
      <Text style={{ fontSize: 40, textAlign: "center" }}>
        Confeitaria não encontrada!
      </Text>
    );
  }

  return (
    <View style={stylesCard.container}>
      <Header />

      <ScrollView
        contentContainerStyle={stylesCard.containerScrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagem da confeitaria */}

        <View style={stylesCard.containerPrincipal}>
          <View style={stylesCard.imageContainer}>
            <TouchableOpacity
              style={stylesCard.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign
                name="arrowleft"
                size={22}
                color="#fff"
                style={stylesCard.backButtonText}
              />
            </TouchableOpacity>
            <Image
              source={{ uri: confeitaria.imagemUrl }}
              style={stylesCard.singleImageStyle}
            />
          </View>

          {/* Nome da Confeitaria e botão de favorito */}

          <View style={stylesPrinciapl.nomeConfeitariaContainer}>
            {/* Nome da confeitaria centralizado */}
            <Text style={stylesPrinciapl.nomeConfeitaria}>
              {confeitaria.nome}
            </Text>
            {/* Ícone do coração alinhado à direita */}
            <TouchableOpacity onPress={adicionarFavorito}>
              <AntDesign
                name={isFavorited ? "heart" : "hearto"}
                size={30}
                color="red"
                style={stylesPrinciapl.heartIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Renderizando a seção de Categorias */}
          {/* {categorias.length > 0 && (
            <View>
              <Text>
                <View style={stylesPrinciapl.categoriasContainer}>
                  {categorias.map((categoria) => (
                    <View
                      key={categoria.id}
                      style={stylesPrinciapl.categoriaItem}
                    >
                      <Text style={stylesPrinciapl.categoriaNome}>
                        {categoria.nomeCategoria}
                      </Text>
                    </View>
                  ))}
                </View>
              </Text>
            </View>
          )} */}

          <Text
            style={{
              fontSize: 22,
              color: Colors.BonPoint.Primaria,
              padding: 16,
              fontWeight: "900",
              marginBottom: -10,
            }}
          >
            Categorias de produtos oferecidos pela confeitaria:
          </Text>
          <FlatList
            data={categorias}
            keyExtractor={(categoria) => categoria.id.toString()}
            numColumns={3} // Define o número de colunas
            columnWrapperStyle={stylesPrinciapl.categoriasContainer}
            renderItem={({ item }) => (
              <View style={stylesPrinciapl.categoriaItem}>
                <Text style={stylesPrinciapl.categoriaNome}>
                  {item.nomeCategoria}
                </Text>
              </View>
            )}
          />

          {/* Endereço da Confeitaria */}

          <Text style={stylesPrinciapl.enderecoConfeitaria}>
            {confeitaria.endereco}, {""}
            {confeitaria.bairro}, {""}
            {confeitaria.cidade}
          </Text>

          {/* Exibir Média de Estrelas com estrelas */}

          {mediaEstrelas !== null && (
            <View style={stylesPrinciapl.mediaEstrelasContainer}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "800",
                  textAlign: "center",
                }}
              >
                Avaliações
              </Text>
              {/* Nota da média */}
              {/* <Text style={stylesPrinciapl.mediaNota}>
                {mediaEstrelas.toFixed(1)} de 5
              </Text> */}
              {/* Componente de estrelas com ajuste de tamanho */}
              <StarRating rating={mediaEstrelas} />
            </View>
          )}
        </View>

        {/* Renderizando a seção de Produtos */}
        {produtos.length > 0 && (
          <View style={stylesProduto.containerSegundario}>
            <Text
              style={{
                marginTop: 14,
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Produtos Disponíveis
            </Text>
            <ConfeitariaProduto
              produtos={produtos}
              onProductPress={visualizarProduto}
            />
          </View>
        )}

        {/* Avaliação do usuário */}
        <View style={stylesAvaliacao.containerTereceiro}>
          <ConfeitariaAvaliacao
            idConfeitaria={confeitaria.idConfeitaria}
            usuario={usuario!}
          />
        </View>

        {/* Botão de Contato */}
        <View style={styles.buttonStylesConfeitaria}>
          <Button
            titulo="Entra em Contato"
            onPress={() => {
              if (confeitaria) {
                router.push({
                  pathname: "/(routes)/chat",
                  params: {
                    idConfeitaria: confeitaria.idConfeitaria,
                    idUsuarioDestinatario: confeitaria.idConfeitaria, // Usando o mesmo ID
                  },
                });
              } else {
                console.error(
                  "Confeitaria não encontrada, idConfeitaria não pode ser enviado."
                );
              }
            }}
            background={Colors.BonPoint.Primaria}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ConfeitariaScreen;
