import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FUNDO from "../assets/login-fundo.png";
import api from "../provider/api";
import { salvarToken, salvarUsuario, verificarLogin } from "../utils/storage";
import { ENDPOINTS } from "../utils/endpoints";
import ModalEsqueceuSenha from "../components/ModalEsqueceuSenha";
import ModalEsqueceuSenhaSucesso from "../components/ModalEsqueceuSenhaSucesso";
import Toast from "../components/Toast";

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
  const [isEnviandoSenha, setIsEnviandoSenha] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");

  useEffect(() => {
    verificarLogin().then(setLogado);
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;
    if (logado) router.push("/estoque");
  }, [navigationState?.key, logado]);

  /* =========================
      LOGICA DE TOAST (PRESERVADA)
  ========================= */
  const showToast = useCallback((type, message, duration = 2500) => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
    if (type !== "loading") {
      setTimeout(() => setToastVisible(false), duration);
    }
  }, []);

  /* =========================
      EXECUTOR PADRÃO (PRESERVADO)
  ========================= */
  const executarComToast = useCallback(
    async (fn, config) => {
      const {
        loadingMsg = "Carregando...",
        successMsg = "Sucesso!",
        errorMsg = "Erro ao processar!",
        minTime = 800,
        onSuccess,
      } = config;

      const startTime = Date.now();
      showToast("loading", loadingMsg);

      try {
        const result = await fn();

        const elapsed = Date.now() - startTime;
        if (elapsed < minTime) {
          await new Promise((res) => setTimeout(res, minTime - elapsed));
        }
        showToast("success", successMsg);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const elapsed = Date.now() - startTime;
        if (elapsed < minTime) {
          await new Promise((res) => setTimeout(res, minTime - elapsed));
        }
        showToast("error", errorMsg);
        throw error;
      }
    },
    [showToast]
  );

  /* =========================
      LOGIN (PRESERVADO)
  ========================= */
  const validarUsuario = useCallback(async () => {
    if (!usuario.trim() || !senha.trim()) {
      showToast("error", "Preencha usuário e senha!");
      return;
    }

    try {
      await executarComToast(
        () => api.post(ENDPOINTS.LOGIN, { login: usuario, senha }),
        {
          loadingMsg: "Entrando...",
          successMsg: "Login realizado com sucesso!",
          errorMsg: "Usuário ou senha inválidos!",
          onSuccess: (res) => {
            salvarUsuario(res.data);
            salvarToken(res.data.token);
            router.push("/estoque");
          },
        }
      );
    } catch (err) {
      console.error("Erro ao fazer login:", err);
    }
  }, [usuario, senha, executarComToast, showToast]);

  /* =========================
      RECUPERAR SENHA (PRESERVADO)
  ========================= */
  const handleRecuperarSenha = useCallback(
    async (cpf) => {
      try {
        await executarComToast(
          () => api.post(ENDPOINTS.RECUPERAR_SENHA_ESQUECIDA, { cpf }),
          {
            loadingMsg: "Enviando e-mail...",
            successMsg: "E-mail enviado com sucesso!",
            errorMsg:
              "Erro ao enviar e-mail! Cadastro não encontrado ou desativado!",
            onSuccess: () => {
              setModalSenhaVisible(false);
              setModalSucessoVisible(true);
            },
          }
        );
      } catch { }
    },
    [executarComToast]
  );

  return (
    <ImageBackground source={FUNDO} style={styles.fundoRaiz} resizeMode="cover">
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
                <Ionicons name="person-outline" size={18} color="#999" style={{ marginRight: 10 }} />
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
                <Pressable onPress={() => setOcultarSenha((prev) => !prev)}>
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

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundoRaiz: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  h1: { fontSize: 60, fontWeight: "bold", color: "#FFFFFF" },
  h2: { fontSize: 32, fontWeight: "bold", color: "#FFFFFF", marginBottom: 10 },
  h4: { fontSize: 16, color: "#FFFFFF", textAlign: "center", paddingHorizontal: 40 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 35,
    marginHorizontal: 20,
    elevation: 5,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, color: "#666", marginBottom: 8 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F1F5",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  input: { flex: 1, fontSize: 16, color: "#333" },
  botao: {
    backgroundColor: "#0F14B8",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  textoBotao: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  linkText: { color: "#0F14B8", fontSize: 13, textAlign: "center" },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: "#666", fontSize: 13 },
  linkTextFooter: { color: "#0F14B8", fontSize: 13, fontWeight: "bold" },
});