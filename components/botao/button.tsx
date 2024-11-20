import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/botao/botao.styles";

export default function Button({ titulo, onPress, background }: TituloButton) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: background }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{titulo}</Text>
    </TouchableOpacity>
  );
}
