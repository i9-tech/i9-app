import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { buscarUsuario, removerUsuario } from "../../../utils/storage";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const router = useRouter();

  useEffect(() => {
    buscarUsuario().then((dados) => setUsuario(dados));
  }, []);

  useEffect(() => {
    global.setHeaderTitulo("Meu Perfil");
    global.setHeaderSubTitulo("Visualize as informações de sua conta");
  }, []);

  return (
    <View style={styles.safe}>
      <View style={styles.container}>
        <Ionicons name="construct-outline" size={70} color="#1E22AA" />

        <Text style={styles.titulo}>Tela de Perfil em construção</Text>

        <Text style={styles.subtitulo}>
          Olá, {usuario?.nome ?? "..."}!{"\n"}
          Esta tela ainda está sendo desenvolvida.
          {"\n"}
          Por favor aguarde a próxima atualização do aplicativo.
        </Text>

        <Pressable
          onPress={async () => {
            await removerUsuario();
            router.push("/");
          }}
          style={{ backgroundColor: "red", padding: 10, borderRadius: 5, marginTop: 20 }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>SAIR</Text>
        </Pressable>
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
