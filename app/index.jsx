import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  Alert,
  ImageBackground,
} from "react-native";
import { styles } from "../styles";
import FUNDO from "../assets/login-fundo.png";
import api from "../provider/api";
import { salvarToken, salvarUsuario, verificarLogin } from "../utils/storage";
import { ENDPOINTS } from "../utils/endpoints";

export default function Home() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    verificarLogin().then((resultado) => setLogado(resultado));
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (logado) {
      router.push("/estoque");
    }
  }, [navigationState?.key, logado]);

  function validarUsuario() {
    console.log("Validando usuário:", usuario);
    if (usuario.trim() === "" || senha.trim() === "") {
      Alert.alert("Erro", "Preencha os campos de usuário e senha!");
      return;
    }

    console.log("indo para chamada");
    api
      .post(ENDPOINTS.LOGIN, { login: usuario, senha: senha })
      .then((res) => {
        // console.log("Usuário lido:", res.data);
        salvarUsuario(res.data);
        salvarToken(res.data.token);
        router.push("/estoque");
      })
      .catch((err) => {
        Alert.alert("Erro", "Usuário ou senha inválidos!");
        console.error("Erro ao fazer login:", err);
      });
    // console.log("finalizando chamada");
  }

  return (
    <ImageBackground
      source={FUNDO}
      style={styles.fundoLogin}
      resizeMode="cover"
    >
      <View
        style={{
          height: "32%",
          width: "100%",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <Text style={styles.h1}>i9</Text>
        <Text style={styles.h1}>Boas Vindas</Text>
        <Text style={styles.h4}>
          Entre em sua conta e tenha acesso a todas as funcionalidades
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "white",
          height: "30%",
          width: "80%",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
        }}
      >
        <View
          style={{
            gap: 30,
            height: "100%",
            width: "100%",
            paddingHorizontal: 20,
            justifyContent: "center",
          }}
        >
          <View>
            <Text>Usuário</Text>
            <TextInput
              placeholder="Digite seu nome aqui..."
              style={styles.inputLogin}
              value={usuario}
              onChangeText={setUsuario}
            />
          </View>
          <View>
            <Text>Senha</Text>
            <TextInput
              style={styles.inputLogin}
              placeholder="************"
              secureTextEntry={true} // esconde a senha
              value={senha}
              onChangeText={setSenha}
            />
          </View>
          <View style={{ width: "100%", alignItems: "center" }}>
            <Pressable onPress={validarUsuario} style={styles.botao}>
              <Text style={styles.textoBotao}>Entrar</Text>
            </Pressable>
          </View>
        </View>
      </View>
      <View>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Função em desenvolvimento!",
              "Em breve você poderá recuperar sua senha",
            )
          }
        >
          <Text>Esqueceu a senha?</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}
