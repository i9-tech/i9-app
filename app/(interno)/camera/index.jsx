import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import Modal from "../../../components/Modal";
import Toast from "../../../components/Toast";

export default function Camera() {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(true);


  // 🔥 TOAST STATE
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    global.setHeaderTitulo("Câmera");
    global.setHeaderSubTitulo("Escaneie a nota fiscal para adicionar os produtos");
  }, []);

  // 🔥 FUNÇÃO PRA MOSTRAR TOAST
  const mostrarToast = (message, type = "success") => {
    setToast({ visible: true, message, type });

    if (type !== "loading") {
      setTimeout(() => {
        setToast({ visible: false, message: "", type });
      }, 4000);
    }
  };

  if (!permissao) {
    return <View style={styles.safe} />;
  }

  if (!permissao.granted && modalVisivel) {
    return (
      <Modal titulo="Permissão Necessária">
        <View style={styles.modalContent}>
          <Text style={styles.textoPermissaoModal}>
            Precisamos da sua permissão para acessar a câmera do dispositivo.
          </Text>

          <Pressable
            style={styles.botaoPrincipal}
            onPress={() => {
              solicitarPermissao();
              setModalVisivel(false);
            }}
          >
            <Text style={styles.textoBotaoPrincipal}>
              Conceder Permissão
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // 📷 SCAN QR
  const aoEscanearCodigo = ({ type, data }) => {
    setEscaneado(true);
    mostrarToast(`Dados da Nota: ${data}`, "success");
  };

  // 📂 SELECIONAR ARQUIVO
  const selecionarArquivo = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    });

    if (resultado.canceled) return;

    const arquivo = resultado.assets[0];
    enviarArquivo(arquivo);
  };

  const enviarArquivo = async (arquivo) => {
  mostrarToast("Enviando arquivo...", "loading");

  const formData = new FormData();

  formData.append("file", arquivo.file);

  try {
    const response = await axios.post(
      "http://localhost:8000/upload",
      formData
    );

    if (response.data.status === "sucesso") {
      mostrarToast("ETL realizado com sucesso!", "success");
    } else {
      mostrarToast("Erro ao processar arquivo", "error");
    }

  } catch (error) {
    console.log("ERRO REAL:", error.response?.data);
    mostrarToast("Erro ao enviar arquivo", "error");
  }
};

  return (
    <View style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="camera" size={22} color="#111" />
          <Text style={styles.titulo}>Ler nota fiscal</Text>
        </View>

        <Text style={styles.subtitulo}>
          Aponte a câmera ou envie um arquivo Excel
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={escaneado ? undefined : aoEscanearCodigo}
        />
      </View>

      <Pressable style={styles.uploadBox} onPress={selecionarArquivo}>
        <Ionicons name="cloud-upload-outline" size={28} color="#0F14B8" />
        <Text style={styles.uploadTitle}>Enviar nota fiscal</Text>
        <Text style={styles.uploadSubtitle}>
          Toque para selecionar o arquivo Excel
        </Text>
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
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: "#EBEBEB",
    justifyContent: "center",
    alignItems: "center",
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