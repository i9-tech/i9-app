import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import api from "../../../provider/api";
import Modal from "../../../components/Modal";
import Toast from "../../../components/Toast";
import { recuperarToken } from "../../../utils/storage";

export default function Camera() {
  const { t } = useTranslation();
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(true);
  const [urlConsulta, setUrlConsulta] = useState(null);
  const [chaveAtual, setChaveAtual] = useState(null);
  const webViewRef = useRef(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    global.setHeaderTitulo(t("camera.header_titulo"));
    global.setHeaderSubTitulo(t("camera.header_subtitulo"));
  }, [t]);

  // 🔥 TOAST
  const mostrarToast = (message, type = "success") => {
    setToast({ visible: true, message, type });

    if (type !== "loading") {
      setTimeout(() => {
        setToast({ visible: false, message: "", type: "success" });
      }, 4000);
    }
  };

  // 🔥 EXTRAIR CHAVE NFC-E
  const extrairChNFe = (data) => {
    try {
      console.log("QR LIDO:", data);
      if (!data) return null;

      const texto = String(data);
      const chave44 = texto.match(/\d{44}/);

      if (chave44) {
        console.log("CHAVE ENCONTRADA:", chave44[0]);
        return chave44[0];
      }

      if (texto.includes("p=")) {
        return texto.split("p=")[1].split("|")[0];
      }

      if (texto.includes("chNFe=")) {
        return texto.split("chNFe=")[1].split("&")[0];
      }

      return null;
    } catch (error) {
      console.log("Erro ao extrair chave:", error);
      return null;
    }
  };

  // 🔥 SEM PERMISSÃO
  if (!permissao) {
    return <View style={styles.safe} />;
  }

  // 🔥 MODAL PERMISSÃO
  if (!permissao.granted && modalVisivel) {
    return (
      <Modal titulo={t("camera.permissao_titulo")}>
        <View style={styles.modalContent}>
          <Text style={styles.textoPermissaoModal}>
            {t("camera.permissao_texto")}
          </Text>
          <Pressable
            style={styles.botaoPrincipal}
            onPress={() => {
              solicitarPermissao();
              setModalVisivel(false);
            }}
          >
            <Text style={styles.textoBotaoPrincipal}>
              {t("camera.conceder_permissao")}
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // 🔥 ESCANEAR QR
  const aoEscanearCodigo = async ({ data }) => {
    try {
      if (escaneado) return;
      setEscaneado(true);

      const chave = extrairChNFe(data);
      console.log("CHAVE:", chave);

      if (!chave) {
        mostrarToast(t("camera.qr_invalido"), "error");
        return;
      }

      const url = `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?nfe=${chave}`;
      setChaveAtual(chave);
      setUrlConsulta(url);
    } catch (error) {
      console.log(error);
      mostrarToast(t("camera.erro_abrir_consulta"), "error");
    } finally {
      setTimeout(() => setEscaneado(false), 3000);
    }
  };

  // 🔥 PROCESSAR HTML
  const processarHTML = async (html) => {
    try {
      mostrarToast(t("camera.processando_nota"), "loading");
      const token = await recuperarToken();

      const response = await api.post(
        "/nfce/processar-html",
        { html, chNFe: chaveAtual },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("NOTA PROCESSADA:", response.data);
      mostrarToast(t("camera.nota_processada"), "success");
      setUrlConsulta(null);
    } catch (error) {
      console.log("ERRO:", error?.response?.data);
      mostrarToast(t("camera.erro_processar"), "error");
    }
  };

  // 🔥 SELECIONAR EXCEL
  const selecionarArquivo = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    });

    if (resultado.canceled) return;
    enviarArquivo(resultado.assets[0]);
  };

  // 🔥 ENVIAR EXCEL
  const enviarArquivo = async (arquivo) => {
    mostrarToast(t("camera.enviando_arquivo"), "loading");
    const formData = new FormData();
    formData.append("file", arquivo.file);

    try {
      const response = await api.post("/upload", formData);

      if (response.data.status === "sucesso") {
        mostrarToast(t("camera.etl_sucesso"), "success");
      } else {
        mostrarToast(t("camera.erro_processar"), "error");
      }
    } catch (error) {
      console.log("ERRO REAL:", error.response?.data);
      mostrarToast(t("camera.erro_enviar"), "error");
    }
  };

  // 🔥 WEBVIEW VIEW
  if (urlConsulta) {
    return (
      <WebView
        ref={webViewRef}
        source={{ uri: urlConsulta }}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        startInLoadingState
        onNavigationStateChange={(navState) => {
          console.log("URL:", navState.url);

          if (navState.url.includes("consulta") && !navState.url.includes("consultaRecaptcha")) {
            webViewRef.current?.injectJavaScript(`
              window.ReactNativeWebView.postMessage(document.documentElement.outerHTML);
              true;
            `);
          }
        }}
        onMessage={async (event) => {
          console.log("HTML RECEBIDO");
          await processarHTML(event.nativeEvent.data);
        }}
      />
    );
  }

  return (
    <View style={styles.safe}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="camera" size={22} color="#111" />
          <Text style={styles.titulo}>{t("camera.ler_nota")}</Text>
        </View>
        <Text style={styles.subtitulo}>{t("camera.aponte_camera")}</Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr", "pdf417", "code128"] }}
          onBarcodeScanned={escaneado ? undefined : aoEscanearCodigo}
        />
      </View>

      <Pressable style={styles.uploadBox} onPress={selecionarArquivo}>
        <Ionicons name="cloud-upload-outline" size={28} color="#0F14B8" />
        <Text style={styles.uploadTitle}>{t("camera.enviar_nota")}</Text>
        <Text style={styles.uploadSubtitle}>{t("camera.toque_selecionar")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F6",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    marginBottom: 25,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginLeft: 10,
  },
  subtitulo: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    fontWeight: "500",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 30,
  },
  modalContent: {
    paddingVertical: 10,
    alignItems: "center",
  },
  textoPermissaoModal: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },
  botaoPrincipal: {
    backgroundColor: "#0F14B8",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  textoBotaoPrincipal: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0F14B8",
    borderRadius: 16,
    paddingVertical: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFF",
    bottom: 10,
  },
  uploadTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#0F14B8",
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
});