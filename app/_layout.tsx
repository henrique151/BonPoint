import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(routes)/bemvindo/index" />
        <Stack.Screen name="(routes)/inicio/index" />
        <Stack.Screen name="(routes)/login/index" />
        <Stack.Screen name="(routes)/registrar/index" />

        <Stack.Screen
          name="(routes)/confeitaria/index"
          options={{
            // headerShown: true,
            // title: "Detalhes da Confeitaria",
            // headerBackTitle: "Voltar",
            // headerStyle: {
            //   backgroundColor: 'transparent',
            // },
            // headerTransparent: true,
          }}
        />

        <Stack.Screen
          name="(routes)/chat/index"
        />

        <Stack.Screen
          name="(routes)/confeitaria/cadastrar"
        />

        <Stack.Screen
          name="(routes)/produtos/adicionar"
          // options={{
          //   headerShown: true,
          //   title: "Adicionar Produto",
          // }}
        />

        <Stack.Screen
          name="(routes)/produtos/visualizar"
          // options={{
          //   headerShown: true,
          //   title: "Visualizar Produto",
          //   headerStyle: {
          //     backgroundColor: "transparent",
          //   },
          //   headerTransparent: true,
          // }}
        />

        <Stack.Screen
          name="(routes)/produtos/alterar"
          // options={{
          //   headerShown: true,
          //   title: "Editar Produto",
          //   headerStyle: {
          //     backgroundColor: "transparent",
          //   },
          //   headerTransparent: true,
          // }}
        />

        <Stack.Screen
          name="(routes)/avaliacao/index"
          // options={{
          //   headerShown: true,
          //   title: "Avaliações da Confeitaria",
          // }}
        />

      </Stack>

  );
}
