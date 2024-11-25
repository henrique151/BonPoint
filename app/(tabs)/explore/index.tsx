import { View, Text, ScrollView, StyleSheet } from 'react-native'
import React from 'react'
import BuscaScreen from '@/screens/busca/busca.screen'

export default function Explore() {
  return (
    <View style={styles.container}>
        <BuscaScreen />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});