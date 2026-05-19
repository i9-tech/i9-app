import { useRootNavigationState, useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Pressable,
  View,
  Text,
  TextInput,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FUNDO from "../assets/login-fundo.png";
import api from "../provider/api";
import {
  salvarToken,
  salvarUsuario,
  verificarLogin,
  salvarIdioma,
} from "../utils/storage";
import { ENDPOINTS } from "../utils/endpoints";
import ModalEsqueceuSenha from "../components/ModalEsqueceuSenha";
import ModalEsqueceuSenhaSucesso from "../components/ModalEsqueceuSenhaSucesso";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [logado, setLogado] = useState(false);
  const [ocultarSenha, setOcultarSenha] = useState(true);

  const [modalSenhaVisible, setModalSenhaVisible] = useState(false);
  const [modalSucessoVisible, setModalSucessoVisible] = useState(false);
  const [modalIdiomaVisivel, setModalIdiomaVisivel] = useState(false);

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
    [showToast],
  );

  /* =========================
      MUDAR IDIOMA
  ========================= */
  const handleMudarIdioma = async (lang) => {
    i18n.changeLanguage(lang);
    await salvarIdioma(lang);
    setModalIdiomaVisivel(false);
  };

  const idiomasList = [
    { code: "pt", label: t("login.idioma_pt") },
    { code: "en", label: t("login.idioma_en") },
    { code: "es", label: t("login.idioma_es") },
  ];

  /* =========================
      LOGIN (PRESERVADO)
  ========================= */
  const validarUsuario = useCallback(async () => {
    if (!usuario.trim() || !senha.trim()) {
      showToast("error", t("login.erro_campos"));
      return;
    }

    try {
      await executarComToast(
        () => api.post(ENDPOINTS.LOGIN, { login: usuario, senha }),
        {
          loadingMsg: t("login.msg_entrando"),
          successMsg: t("login.sucesso_login"),
          errorMsg: t("login.erro_login"),
          onSuccess: (res) => {
            salvarUsuario(res.data);
            salvarToken(res.data.token);
            router.push("/estoque");
          },
        },
      );
    } catch (err) {
      // Erro já tratado no executor
    }
  }, [usuario, senha, executarComToast, showToast, t]);

  /* =========================
      RECUPERAR SENHA (PRESERVADO)
  ========================= */
  const handleRecuperarSenha = useCallback(
    async (cpf) => {
      try {
        await executarComToast(
          () => api.post(ENDPOINTS.RECUPERAR_SENHA_ESQUECIDA, { cpf }),
          {
            loadingMsg: t("login.msg_enviando_email"),
            successMsg: t("login.sucesso_email"),
            errorMsg: t("login.erro_email"),
            onSuccess: () => {
              setModalSenhaVisible(false);
              setModalSucessoVisible(true);
            },
          },
        );
      } catch {}
    },
    [executarComToast, t],
  );

  return (
    <ImageBackground source={FUNDO} style={styles.fundoRaiz}>
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
            <Text style={styles.h2}>{t("login.boas_vindas")}</Text>
            <Text style={styles.h4}>{t("login.subtitulo")}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("login.usuario")}</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color="#999"
                  style={{ marginRight: 10 }}
                />
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
              <Text style={styles.label}>{t("login.senha")}</Text>
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
              <Text style={styles.textoBotao}>{t("login.entrar")}</Text>
            </Pressable>

            <Pressable onPress={() => setModalSenhaVisible(true)}>
              <Text style={styles.linkText}>{t("login.esqueceu_senha")}</Text>
            </Pressable>

            <View style={styles.footerRow}>
              <Pressable onPress={() => setModalIdiomaVisivel(true)}>
                <Text style={styles.linkTextFooter}>
                  {t("login.alterar_idioma")}
                </Text>
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

      {/* MODAL ALTERAR IDIOMA */}
      {modalIdiomaVisivel && (
        <Modal
          titulo={t("login.selecionar_idioma")}
          onClose={() => setModalIdiomaVisivel(false)}
        >
          <View style={styles.modalBody}>
            {idiomasList.map((lang) => (
              <Pressable
                key={lang.code}
                style={[
                  styles.idiomaItem,
                  i18n.language === lang.code && styles.idiomaItemAtivo,
                ]}
                onPress={() => handleMudarIdioma(lang.code)}
              >
                <Text
                  style={[
                    styles.idiomaTexto,
                    i18n.language === lang.code && styles.idiomaTextoAtivo,
                  ]}
                >
                  {lang.label}
                </Text>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#0F14B8" />
                )}
              </Pressable>
            ))}
          </View>
        </Modal>
      )}

      <Toast visible={toastVisible} message={toastMessage} type={toastType} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fundoRaiz: {
    flex: 1,
    width: "100%",
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
  h2: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },
  h4: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 40,
  },
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
  modalBody: { paddingBottom: 10 },
  idiomaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  idiomaItemAtivo: {
    backgroundColor: "#F0F0FF",
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  idiomaTexto: { fontSize: 16, color: "#444" },
  idiomaTextoAtivo: { color: "#0F14B8", fontWeight: "bold" },
});
