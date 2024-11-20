import { View, Text } from 'react-native';
import React from 'react';
import ChatScreen from '@/screens/chat/chat.screen'; // Certifique-se de que este caminho está correto
import { useLocalSearchParams } from 'expo-router';

export default function Chat() {
  const { idConfeitaria } = useLocalSearchParams(); // Pegando o ID da rota

  // Verifica se o idConfeitaria foi corretamente passado
  if (!idConfeitaria) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>O ID da confeitaria não foi fornecido.</Text>
      </View>
    );
  }

  console.log("ID da confeitaria:", idConfeitaria);

  return (
    <View style={{ flex: 1 }}>
      <ChatScreen idConfeitaria={idConfeitaria as string} />
    </View>
  );
}
