import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ConfeitariaScreen from '@/screens/confeitaria/confeitaria.screen';

export default function Confeitaria() {
  const { idConfeitaria } = useLocalSearchParams(); // Usando idConfeitaria como o parâmetro correto

console.log("ID da confeitaria:", idConfeitaria);
  if (!idConfeitaria) {
    return <Text>ID não fornecido.</Text>;
  }

  return (
    <View style={styles.container}>
      <ConfeitariaScreen idConfeitaria={idConfeitaria as string} />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
