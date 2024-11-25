import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BonPoint.Primaria,
    alignItems: "center",
    width: "100%",
    height: "100%",
    padding: 20,
  },
  backButton: {
    top: 34,
    left: -175,
  },
  backButtonText: {
    fontSize: 46,
    color: Colors.BonPoint.Branco,
    marginLeft: 40,
  },
  containerTitle: {
    width: "120%",
    height: 320,
    backgroundColor: Colors.BonPoint.Segundaria,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -18,
    borderRadius: 50,
  },
  backgroundIcon: {
    backgroundColor: "#fff",
    borderRadius: 99,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: -20,
    alignSelf: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.BonPoint.Branco,
    top: -10,
  },
  profileContainer: {
    position: "relative", // Para permitir o posicionamento absoluto do ícone de câmera
    alignItems: "center",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 7,
    color: "#4175c4",
  },
  iconContainer: {
    marginBottom: 20,
  },
  containerInput: {
    marginTop: 30,
    width: "100%",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.BonPoint.Quinta,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    backgroundColor: Colors.BonPoint.Nona,
  },
  icon: {
    marginRight: 10,
    color: Colors.BonPoint.Branco,
  },
  tituloNome: {
    color: Colors.BonPoint.Branco,
    marginBottom: 6,
    fontSize: 17,
    fontWeight: "600",
  },
  tituloSenha: {
    color: Colors.BonPoint.Branco,
    marginBottom: 6,
    fontSize: 17,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: Colors.BonPoint.Branco,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.BonPoint.Quinta,
    borderRadius: 8,
    backgroundColor: Colors.BonPoint.Nona,
    marginBottom: 15,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    height: 55,
    width: "100%",
    color: Colors.BonPoint.Branco,
    marginTop: -2,
  },
  pickerLabel: {
    fontSize: 20,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.BonPoint.Oitava,
  },
  loginButton: {
    backgroundColor: Colors.BonPoint.Segundaria,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 50,
    marginBottom: 20,
    width: "80%",
    borderWidth: 1,
    borderColor: Colors.BonPoint.Quinta,
  },
  loginButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  imagemTexto: {
    textAlign: "center",
    fontSize: 24,
    color: Colors.BonPoint.Oitava,
    fontWeight: "800",
    marginBottom: 24,
  },
  errorContainer: {
    marginVertical: 1,
  },
  errorText: {
    color: Colors.BonPoint.Vermelho,
    fontSize: 16,
    fontWeight: "700",
  },
  loading: {
    color: Colors.BonPoint.Branco,
    backgroundColor: Colors.BonPoint.Primaria,
    justifyContent: "center",
    alignItems: "center",
    height: 1000,
    width: "100%",
  },
});
