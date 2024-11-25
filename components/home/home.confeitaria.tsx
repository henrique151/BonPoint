import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from "react-native";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import ConfeitariaCard from "../confeitaria/confeitaria.card";
import Colors from "@/constants/Colors";

export default function HomeConfeitaria() {
  const [confeitariaData, setConfeitariaData] = useState<Confeitaria[]>([]);
  const [loading, setLoading] = useState(true); // State to track loading status

  useEffect(() => {
    ConfeitariaSelect();
  }, []);

  const ConfeitariaSelect = async () => {
    try {
      setLoading(true); // Set loading to true before fetching data
      const q = query(collection(db, "Confeitaria"));
      const querySnapshot = await getDocs(q);
      const data: Confeitaria[] = [];

      querySnapshot.forEach((doc) => {
        const docData = doc.data() as Omit<Confeitaria, "idConfeitaria">;
        data.push({ idConfeitaria: doc.id, ...docData });
      });

      setConfeitariaData(data);
    } catch (error) {
      console.error("Erro ao buscar os dados da confeitaria:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  const renderItem = ({ item }: { item: Confeitaria }) => (
    <ConfeitariaCard confeitaria={item} />
  );

  return (
    <View style={styles.container}>
      {loading ? ( // Show loading indicator while fetching data
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : confeitariaData.length > 0 ? (
        <FlatList
          data={confeitariaData}
          renderItem={renderItem}
          keyExtractor={(item) => item.idConfeitaria}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.noDataText}>Nenhuma confeitaria encontrada</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.BonPoint.Tercerio, // Optional: Set background color for better visibility
  },
  noDataText: {
    fontSize: 40,
    color: Colors.BonPoint.Primaria,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio, // Match background color for a cohesive look
  },
});
