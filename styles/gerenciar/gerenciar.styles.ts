import { PixelRatio, StyleSheet, Dimensions } from "react-native";
import Colors from "@/constants/Colors";

const screenWidth = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  container: {
    flex: 1,
  },
  containerDois: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Tercerio,
    padding: 10,
  },
  tituloPagina: {
    marginTop: 24,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: Colors.BonPoint.Branco,
  },
  subtitulo: {
    fontSize: 16,
    color: Colors.BonPoint.Branco,
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    borderRadius: 24,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  produtoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#a5c5fd",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    width: "100%",
  },
  produtoImagem: {
    width: screenWidth * 0.18, // Ajuste proporcional
    height: screenWidth * 0.18, // Ajuste proporcional
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  produtoTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    color: "#fff",
    marginBottom: 2,
    flexWrap: "wrap",
    maxWidth: "80%",
  },
  botaoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 8, // menor gap para compactar botões
  },
  botaoEditar: {
    backgroundColor: "#4175c4",
    borderRadius: 10,
    paddingHorizontal: screenWidth * 0.02,
    paddingVertical: 5,
    minWidth: screenWidth * 0.22,
    alignItems: "center",
  },
  botaoExcluir: {
    backgroundColor: "#4175c4",
    borderRadius: 10,
    paddingHorizontal: screenWidth * 0.02,
    paddingVertical: 5,
    minWidth: screenWidth * 0.22,
    alignItems: "center",
  },
  botaoVisualizar: {
    backgroundColor: "#4175c4",
    borderRadius: 10,
    paddingHorizontal: screenWidth * 0.02,
    paddingVertical: 5,
    minWidth: screenWidth * 0.22,
    alignItems: "center",
  },
  botaoTexto: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
  },
  adicionarProdutoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#a5c5fd",
    borderRadius: 24,
    padding: 10,
    marginBottom: 10,
  },
  adicionarProdutoImagem: {
    width: screenWidth * 0.2,
    height: screenWidth * 0.21,
    marginRight: 10,
  },
  adicionarProdutoTexto: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  backButtonText: {
    fontSize: 36,
    color: Colors.BonPoint.Branco,
  },
  backButton: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    backgroundColor: "#4175c4",
    borderRadius: 99,
    position: "absolute",
    top: 25,
    alignItems: "center",
    justifyContent: "center",
    left: 5,
    zIndex: 10001,
  },
});
