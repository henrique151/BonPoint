import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { styles } from "@/styles/confeitaria/confeitaria.styles";

type ConfeitariaCardProps = {
  confeitaria: Confeitaria;
};

const ConfeitariaCard: React.FC<ConfeitariaCardProps> = ({ confeitaria }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true); // Loading state

  const DetalhesConfeitaria = () => {
    router.push({
      pathname: "/(routes)/confeitaria",
      params: { idConfeitaria: confeitaria.idConfeitaria },
    });
  };

  const consultarCategorias = async (categoriasIds: string[]) => {
    setLoading(true); // Set loading to true before fetching
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
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    if (confeitaria.categoria) {
      consultarCategorias(confeitaria.categoria);
    }
  }, [confeitaria.categoria]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={DetalhesConfeitaria}>
        <View style={styles.conteinerConfeitaria}>
          <Text style={styles.tituloConfeitaria}>{confeitaria.nome}</Text>
          {categorias.length > 0 && (
            <View style={styles.categoriaContainer}>
              <View style={styles.categoriaLista}>
                {categorias.map((categoria) => (
                  <Text key={categoria.id} style={styles.categoriaItem}>
                    {categoria.nomeCategoria}
                  </Text>
                ))}
              </View>
            </View>
          )}
          <Image
            source={{ uri: confeitaria.imagemUrl }}
            style={styles.imagemConfeitaria}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ConfeitariaCard;
