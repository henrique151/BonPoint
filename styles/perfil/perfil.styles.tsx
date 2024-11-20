import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30
      },
      text: {
        fontSize: 20,
        marginBottom: 20,
      },
      logoutButton: {
        backgroundColor: Colors.BonPoint.Nona,
        padding: 10,
        borderRadius: 5,
      },
      logoutButtonText: {
        color: Colors.BonPoint.Branco,
        fontSize: 16,
      },
})