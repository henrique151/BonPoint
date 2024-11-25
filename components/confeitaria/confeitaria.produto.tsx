import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { stylesProduto } from '@/styles/confeitaria/confeitariaCard.styles';

const ConfeitariaProduto: React.FC<{ produtos: any[], onProductPress: (id: string) => void }> = ({ produtos, onProductPress }) => {
  return (
    <View style={stylesProduto.containerProduto}>
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.idProduto}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}  // Garante espaçamento uniforme
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={stylesProduto.productCardProduto}
            onPress={() => onProductPress(item.idProduto)}
          >
            {item.imagemProduto ? (
              <Image
                source={{ uri: item.imagemProduto }}
                style={stylesProduto.productImageProduto}
              />
            ) : (
              <Text>Sem Imagem</Text>
            )}
            <Text style={stylesProduto.productTitleProduto}>{item.nomeProduto}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ConfeitariaProduto;
