import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";
import { teal100 } from "react-native-paper/lib/typescript/styles/themes/v2/colors";

export const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.BonPoint.Segundaria,
    borderRadius: 26,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 90,
    marginTop: 30,
  },
  titulo: {
    marginTop: 15,
    fontSize: 30,
    textDecorationLine: "underline",
    fontWeight: "700",
  },
  texto: {
    padding: 4,
    fontSize: 25,
    marginTop: 15,
    textAlign: "justify",
  },
  emailUsuario: {
    color: Colors.BonPoint.Tercerio,
    fontWeight: "400",
    fontStyle: "italic",
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
    gap: 4,
    paddingLeft: 5,
    paddingRight: 5,
  },
  codeInput: {
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 1000,
    padding: 14,
    width: 40,
    textAlign: "center",
  },
  loginButton: {
    marginTop: 30,
    zIndex: 10001,
    width: 150,
    padding: 12,
    backgroundColor: Colors.BonPoint.Primaria,
    textAlign: 'center',
    alignItems: 'center',
    borderRadius:12,
  },
  loginButtonText: {
    color: Colors.BonPoint.Branco,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    zIndex: 10001,
  },
  jorge: {
    width: 275,
    height: 275,
    alignSelf: "flex-start",
    marginTop: -60,
    marginBottom: -19,
    marginLeft: 162,
  },
  loading: {
    flex: 1,
    color: Colors.BonPoint.Branco,
    backgroundColor: Colors.BonPoint.Primaria,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
