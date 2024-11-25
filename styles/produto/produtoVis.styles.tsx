import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  containerScrollView: {
   flexGrow: 1,
  },
  container: {
    flex: 1,
  },
  containerDois: {
    justifyContent: "center",
    flex: 1,
    padding: 16,
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Decimo_Pri,
  },
  card: {
    flex: 1,
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  imagemProduto: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 3,
    borderColor: Colors.BonPoint.Preto,
  },
  backButton: {
    position: "absolute",
    top: -12,
    left: -10,
    backgroundColor: Colors.BonPoint.Primaria,
    borderRadius: 20,
    padding: 4,
  },
  nomeProduto: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.BonPoint.Preto_2,
    marginBottom: 8,
  },
  descricaoProduto: {
    fontSize: 18,
    textAlign: "justify",
    marginTop: 4,
    color: Colors.BonPoint.Preto_2,
  },
});
