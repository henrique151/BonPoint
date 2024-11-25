import Colors from "@/constants/Colors";
import { Dimensions, StyleSheet, PixelRatio } from "react-native";

const screenWidth = Dimensions.get("window").width;
const itemWidth = screenWidth / 2 - 16;
const itemWidthDois = screenWidth / 3 - 20;
export const stylesCard = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Segundaria,
  },
  containerScrollView: {
    alignItems: "center",
    width: "auto",
  },
  containerPrincipal: {
    backgroundColor: Colors.BonPoint.Decimo,
    width: "95%",
    height: "auto",
    borderRadius: 30,
    marginTop: 10,
  },
  singleImageStyle: {
    marginTop: 10,
    width: PixelRatio.getPixelSizeForLayoutSize(135),
    height: PixelRatio.getPixelSizeForLayoutSize(90),
    borderRadius: 16,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.BonPoint.Preto,
    resizeMode: "cover",
  },
  imageContainer: {
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 36,
    color: Colors.BonPoint.Branco,
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: "#4175c4",
    borderRadius: 99,
    position: "absolute",
    top: 20,
    alignItems: "center",
    justifyContent: "center",
    left: 30,
    zIndex: 100001,
  },
});

export const stylesPrinciapl = StyleSheet.create({
  nomeConfeitariaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    textAlign: "center",
    paddingHorizontal: 10,
    marginLeft: 30,
  },
  nomeConfeitaria: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginRight: 5,
  },
  heartIcon: {
    marginLeft: 0,
  },
  enderecoConfeitaria: {
    fontSize: 18,
    textAlign: "left",
    marginHorizontal: 10,
    color: Colors.BonPoint.Cinza_2,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 10,
    marginLeft: 16,
  },
  categoriasContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 3,
  },
  categoriaItem: {
    width: itemWidthDois, // Define a largura do item com base na largura da tela
    alignItems: "flex-start",
    alignSelf: "center",
  },
  categoriaNome: {
    fontSize: 21,
    fontWeight: "700",
    color: Colors.BonPoint.Primaria,
    textAlign: "center",
  },
  mediaEstrelasContainer: {
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  mediaNota: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fffc00",
    marginBottom: 8, // Espaço entre a nota e as estrelas
  },
});

export const stylesProduto = StyleSheet.create({
  containerSegundario: {
    flex: 1,
    width: "100%",
    borderRadius: 30,
    marginTop: 10,
    //backgroundColor: "#658ece",
  },
  containerProduto: {
    padding: 4,
    flex: 1,
  },
  titleProduto: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  productCardProduto: {
    width: itemWidth, // Largura de cada item para caber 2 por linha
    // flex: 1,
    backgroundColor: Colors.BonPoint.Branco,
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  productImageProduto: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    marginBottom: 3,
    borderWidth: 2,
    borderColor: Colors.BonPoint.Preto,
    borderRadius: 20,
  },
  productTitleProduto: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.BonPoint.Preto_2,
    textAlign: "center",
  },
});

export const stylesAvaliacao = StyleSheet.create({
  loadingContainer: {
    position: "absolute", // Torna o View uma sobreposição
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10, // Garante que fique acima de outros elementos
  },
  containerTereceiro: {
    flex: 1,
    width: "95%",
    height: "auto",
    backgroundColor: Colors.BonPoint.Decimo,
    borderRadius: 30,
    padding: 16,
    marginTop: 16,
  },
  container: {
    marginTop: 4,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },

  tituloSegundo: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.BonPoint.Preto,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  avaliacaoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  usuarioNomeContainer: {
    flexDirection: "row", // Alinha os itens na horizontal
    justifyContent: "space-between", // Coloca o nome à esquerda e a lixeira à direita
    alignItems: "center", // Alinha verticalmente ao centro
  },
  usuarioNome: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 5,
    flex: 1, // Permite que o texto ocupe o espaço disponível
  },
  excluirButton: {
    marginLeft: 10, // Adiciona espaço entre o nome e o ícone
    justifyContent: "center",
    alignItems: "center",
  },
  avaliacaoContainerDois: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    marginLeft: -3,
  },
  button: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Primaria,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  avaliacaoTexto: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  estrelasContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  comentarioContainer: {
    marginVertical: 20,
  },
  comentarioInput: {
    height: 40,
    borderColor: Colors.BonPoint.Cinza_3,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  comentariosContainer: {
    marginVertical: 10,
  },
  comentarioItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BonPoint.Cinza_3,
  },
  avaliacaoFinalContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  comentario: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  comentarioTexto: {
    fontSize: 20,
    color: "#333",
  },
  usuarioContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingVertical: 10, // Adds vertical spacing
  },
  usuarioImagem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  usuarioImagemPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
    marginRight: 10,
  },
  comentarioTextoContainer: {
    flex: 1,
    marginLeft: 10, // Adds spacing between user image and text
  },
  verMaisButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: Colors.BonPoint.Primaria,
    borderRadius: 5,
    alignItems: "center",
  },
  verMaisText: {
    color: "white",
    fontWeight: "bold",
  },
  dataTexto: {
    fontSize: 17,
    color: "#777",
    marginBottom: 5,
  },
  containerLixeria: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  comentarioTextoWrapper: {
    flexDirection: "row", // Coloca o texto e o botão em linha
    alignItems: "center", // Alinha verticalmente ao centro
    marginTop: 5, // Espaçamento adicional
  },
});

// Comentario Styles
export const stylesComentario = StyleSheet.create({
  comentariosContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  comentarioItem: {
    backgroundColor: Colors.BonPoint.Branco,
    borderWidth: 1,
    borderColor: Colors.BonPoint.Setima,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  comentarioInput: {
    borderColor: Colors.BonPoint.Setima,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: Colors.BonPoint.Branco,
  },
});
