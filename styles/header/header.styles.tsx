import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  backgroundFundo: {
    backgroundColor: Colors.BonPoint.Primaria,
    padding: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20
  },
  textContainer: {
    marginLeft: 8, 
    
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25, 
  },
  greeting: {
    fontSize: 17,
    fontWeight: "bold",
    color: '#fff'
  },
  username: {
    fontSize: 14,
    fontWeight: "normal", 
  },
  logo: {
    width: 120,
    height: 60,
    marginTop: 10
  },
  userId: {
    fontSize: 15
  }
});
