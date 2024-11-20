import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
  },
  container: {
    flex: 1,
  },
  blockedUserContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  blockedUserText: {
    fontSize: 18,
    textAlign: "center",
    color: "white",
    padding: 10,
  },
  backButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.BonPoint.Setima,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  unlockText: {
    marginTop: 15,
    textAlign: "center",
    color: Colors.BonPoint.Setima,
    fontWeight: "bold",
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    backgroundColor: Colors.BonPoint.Primaria,
    height: 100,
    paddingTop: 16,
    justifyContent: "space-between",
  },
  backIcon: {
    marginRight: 20,
  },
  icon: {
    marginLeft: 10,
  },
  confeitariaInfo: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 10,
    alignItems: "center",
 
  },
  confeitariaImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  confeitariaName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  usuarioName: {
    fontSize: 16,
    color: Colors.BonPoint.Branco_3,
    fontWeight: "700",
   
  },
  
  usuarioNameEvento: {
    fontSize: 16,
    color: Colors.BonPoint.Branco_3,
    fontWeight: "700",
    // Remova flexDirection se não for necessário
    marginTop: 4, // Adiciona um pequeno espaço entre o nome e a descrição
  },
  menuContainer: {
    paddingLeft: 50,
    backgroundColor: "transparent",
  },
  menu: {
    marginTop: 55,
    backgroundColor: "transparent",
  },
  menuItems: {
    backgroundColor: "transparent",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: "#658ECE",
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  dateText: {
    color: Colors.BonPoint.Branco,
    fontSize: 14,
    fontWeight: "700",
  },
  messageContainer: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  selectedMessage: {
    backgroundColor: "#ccc",
    borderRadius: 16, // Adiciona um fundo branco se selecionada
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 99,
    marginHorizontal: 10,
    alignItems: "center",
    marginBottom: 5,
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    maxWidth: "70%",
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
  },
  messageText: {
    marginTop: 5,
  },
  timeText: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  containerImagem: {
    backgroundColor: "#698ec9",

  },
  selectedImagesContainer: {
    flexDirection: "row", 
    flexWrap: "wrap", 
    marginVertical: 10, 
    gap: 10,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 5,
    borderWidth: 2,
    borderColor: "white",
    marginHorizontal: 10
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.BonPoint.Tercerio,
  },
  trashIcon: {
    marginRight: 8,
  },
  imageIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 10,
    padding: 5,
    color: "#fff",
    paddingLeft: 10,
  },
  sendIcon: {
    marginLeft: 8,
  },
  modelFalso: {
    flex: 1,
  },
  modalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.BonPoint.Primaria,
  },
  modalTitle: {
    fontSize: 26, // Tamanho da fonte um pouco maior
    marginBottom: 20,
    color: "#fff",
    fontWeight: "bold", // Negrito para destaque
  },
  modalInput: {
    width: "100%",
    height: 150,
    backgroundColor: Colors.BonPoint.Tercerio,
    borderRadius: 10,
    padding: 15, // Aumentamos o padding
    marginBottom: 20,
    shadowColor: "#000", // Sombra para dar profundidade
    shadowOffset: {
      width: 0,
      height: 2,
    },
    borderWidth: 1,
    borderColor: "white",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Para Android
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.BonPoint.Tercerio, // Cor de fundo do botão
    borderRadius: 10, // Borda arredondada
    padding: 10,
    width: "100%", // O botão ocupa toda a largura disponível
    alignItems: "center", // Centraliza o texto do botão
    marginBottom: 10, // Espaçamento entre botões
  },
  buttonText: {
    color: "#fff", // Cor do texto do botão
    fontSize: 18, // Tamanho da fonte
    fontWeight: "bold", // Negrito
  },
  cancelarButton: {
    backgroundColor: "red",
  },
  denunciarText: {
    color: "red",
    textDecorationLine: "underline",
    marginTop: 10, // Adiciona um pouco de espaçamento acima
  },
  backButtonDois: {
    backgroundColor: Colors.BonPoint.Tercerio,
    borderRadius: 99,
    position: "absolute", // Para posicionar o botão de volta no canto superior
    top: 20, // Distância do topo
    left: 20, // Distância da esquerda
    padding: 10, // Espaçamento interno
  },
});
