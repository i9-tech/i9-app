import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";


export default function Ajuda() {
  useEffect(() => {
    global.setHeaderTitulo("Ajuda");
    global.setHeaderSubTitulo("Contato com suporte i9Tech");
  }, []);

  return (
    <View style={styles.safe}>

      <View style={styles.container}>

        <Ionicons
          name="construct-outline"
          size={70}
          color="#1E22AA"
        />

        <Text style={styles.titulo}>
          Tela de Ajuda em construção
        </Text>

        <Text style={styles.subtitulo}>
          Esta tela ainda está sendo desenvolvida.
          {"\n"}
          Por favor aguarde a próxima atualização do aplicativo.
        </Text>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  titulo: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  subtitulo: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});