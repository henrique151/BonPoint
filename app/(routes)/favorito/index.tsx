import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import FavoritoScreen from '@/screens/favorito/favorito.screen';

export default function Favorito() {
  return (
    <View style={styles.container}>
      <FavoritoScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

});
