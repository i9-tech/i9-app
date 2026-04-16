import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  Alert,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FUNDO from "../assets/login-fundo.png";
import api from "../provider/api";
import { salvarToken, salvarUsuario, verificarLogin } from "../utils/storage";
import { ENDPOINTS } from "../utils/endpoints";
import ModalEsqueceuSenha from "../components/ModalEsqueceuSenha";
import ModalEsqueceuSenhaSucesso from "../components/ModalEsqueceuSenhaSucesso";

const { height } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);
  const [ocultarSenha, setOcultarSenha] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [modalSucessoVisible, setModalSucessoVisible] = useState(false);

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
    if (usuario.trim() === "" || senha.trim() === "") {
      Alert.alert("Erro", "Preencha os campos de usuário e senha!");
      return;
    }

    api
      .post(ENDPOINTS.LOGIN, { login: usuario, senha: senha })
      .then((res) => {
        salvarUsuario(res.data);
        salvarToken(res.data.token);
        router.push("/estoque");
      })
      .catch((err) => {
        Alert.alert("Erro", "Usuário ou senha inválidos!");
        console.error("Erro ao fazer login:", err);
      });
  }

  function handleRecuperarSenha(cpf) {
    console.log("CPF enviado:", cpf);

    setModalSenhaVisible(false);
    setModalSucessoVisible(true);

    // Exemplo real com API:
    /*
    api.post(ENDPOINTS.RECUPERAR_SENHA, { cpf })
      .then(() => {
        setModalSenhaVisible(false);
        setModalSucessoVisible(true);
      })
      .catch(() => {
        Alert.alert("Erro", "Não foi possível recuperar a senha.");
      });
    */
  }
  return (
    <View style={styles.container}>
      <View style={styles.bgContainer}>
        <ImageBackground source={FUNDO} style={styles.fundo} resizeMode="cover" />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.h1}>i9</Text>
            <Text style={styles.h2}>Boas Vindas</Text>
            <Text style={styles.h4}>
              Entre em sua conta e tenha acesso a{"\n"}todas as funcionalidades
            </Text>
          </View>

          <View style={styles.card}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Usuário</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={18} color="#999" style={styles.iconLeft} />
                <TextInput
                  style={styles.input}
                  placeholder="i9@cpf"
                  placeholderTextColor="#A0A0A0"
                  value={usuario}
                  onChangeText={setUsuario}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="********"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={ocultarSenha}
                  value={senha}
                  onChangeText={setSenha}
                />
                <Pressable onPress={() => setOcultarSenha(!ocultarSenha)}>
                  <Ionicons
                    name={ocultarSenha ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable onPress={validarUsuario} style={styles.botao}>
              <Text style={styles.textoBotao}>Entrar</Text>
            </Pressable>

            <Pressable onPress={() => setModalSenhaVisible(true)}>
              <Text style={styles.linkText}>Você esqueceu sua senha?</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Não possui conta? </Text>
              <Pressable onPress={() => Alert.alert("Suporte", "Entre em contato com o suporte I9.")}>
                <Text style={styles.linkTextFooter}>Contate-nos</Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ModalEsqueceuSenha
        visible={modalSenhaVisible}
        onClose={() => setModalSenhaVisible(false)}
        onSubmit={handleRecuperarSenha}
        disabled={false}
      />

      <ModalEsqueceuSenhaSucesso
        visible={modalSucessoVisible}
        onClose={() => setModalSucessoVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },
  bgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  fundo: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },

  header: {
    alignItems: "center",
    marginBottom: 50,
    marginTop: 10,
  },
  h1: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: -5,
  },
  h2: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 15,
  },
  h4: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 25,
    paddingVertical: 35,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F6F8",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    outlineStyle: "none",
  },
  botao: {
    backgroundColor: "#0F14B8",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  linkText: {
    color: "#5B65D6",
    fontSize: 12,
    textAlign: "center",
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },
  footerText: {
    color: "#333",
    fontSize: 12,
  },
  linkTextFooter: {
    color: "#5B65D6",
    fontSize: 12,
  },
});