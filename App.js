import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, Text, View, Image, Pressable, Alert } from "react-native";
import imagemUm from "./assets/icon.png";
import imagemDois from "./assets/favicon.png";

// fazer uma imagem no meio da tela para que quando clicar ela transforma outra

export default function App() {
  const [imagem, setImagem] = useState(true);

  return (
    <View style={styles.container}>
      <Text>Clique na imagem abaixo</Text>
      <StatusBar style="auto" />
      <View>
        <Pressable
          onPress={() => {
            setImagem(!imagem);
          }}
        >
          <Image style={styles.img} source={imagem ? imagemUm : imagemDois} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 200,
    height: 200,
  },
});
