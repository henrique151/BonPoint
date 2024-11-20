import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    wrapper: {
      //flex: 1,
    },
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f9f9f9",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginHorizontal: 10,
      marginTop: 25,
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: "#000",
    },
    cancelText: {
      color: Colors.BonPoint.Primaria,
      fontSize: 16,
      marginLeft: 10,
    },
    categoryContainer: {
      flexDirection: "row",
      marginVertical: 2,
      marginHorizontal: 2,
      borderRadius: 8,
      padding: 5,
      paddingLeft: 10,
    },
    categoryButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginRight: 10,
      borderRadius: 20,
      backgroundColor: "#e0e0e0",
    },
    categoryText: {
      fontSize: 14,
      color: "#333", // Texto não tão forte
    },
    selectedCategoryText: {
      color: Colors.BonPoint.Primaria,
      fontWeight: "bold",
    },
    suggestionContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#e0e0e0",
      marginHorizontal: 10,    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 10,
    },
    infoContainer: {
      flex: 1,
    },
    suggestionTitle: {
      fontSize: 16,
      color: "#000",
    },
    suggestionCategory: {
      fontSize: 12,
      color: "gray",
    },
    categoriesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 5,
    },
    categoryItemContainer: {
      borderWidth: 1,
      borderColor: "#ff66b2", // Borda rosa
      borderRadius: 15,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 5,
      marginBottom: 5,
    },
    categoryItem: {
      fontSize: 12,
      color: "#666", // Texto não tão forte
    },
    suggestionsList: {
      // Ajuste a altura máxima conforme necessário
      // maxHeight: 300, // Definido para fornecer uma altura máxima para o ScrollView
    },
    buttonContainer: {
      alignItems: "center",
      marginVertical: 10,
    },
    navigateButton: {
      backgroundColor: Colors.BonPoint.Primaria,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
  