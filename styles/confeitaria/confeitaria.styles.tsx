import { Dimensions, StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

const screenWidth = Dimensions.get("window").width;
const IMAGE_WIDTH = screenWidth * 0.9;
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.6;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 8,
    backgroundColor: Colors.BonPoint.Branco,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  conteinerConfeitaria: {
    width: "95%",
    height: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  imagemConfeitaria: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.BonPoint.Preto,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  infoConfeitaria: {
    padding: 0,
    alignItems: "center",
  },
  tituloConfeitaria: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  categoriaContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  categoriaLista: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  categoriaItem: {
    borderRadius: 4,
    paddingHorizontal: 4,
    marginRight: 6,

    fontSize: 18,
    color: Colors.BonPoint.Setima,
    fontWeight: "800",
  },
  enderecoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
  },
  enderecoConfeitaria: {
    fontSize: 14,
    fontWeight: "bold",
  },
  enderecoText: {
    fontSize: 14,
    color: Colors.BonPoint.Cinza_3,
    marginLeft: 4,
  },
  buttonStylesConfeitaria: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

