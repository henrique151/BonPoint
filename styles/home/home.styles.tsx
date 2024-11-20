import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 6,
    backgroundColor: Colors.BonPoint.Segundaria,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  botaoVerTodos: {
    padding: 8,
    backgroundColor: Colors.BonPoint.Branco_3,
    borderRadius: 10,
  }
});
