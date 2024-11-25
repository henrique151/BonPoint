import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.BonPoint.Primaria,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    width: "100%",
    height: "100%",
  },
  container_2: {
    width: 408,
    height: 811,
    backgroundColor: Colors.BonPoint.Segundaria,
    top: 142,
  },
  meio_ciruclo: {
    width: 497,
    height: 382,
    top: -70,
    left: -25,
  },
  textContainer: {
    bottom: 340,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.BonPoint.Cinza,
    padding: 16,
    textAlign: 'justify'
  },
  imagem_logo: {
    width: 307,
    height: 151,
    top: 80,
  },
  buttonStyles: {
    top: -320,
    marginLeft: 87,
  },
});
