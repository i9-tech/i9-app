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
import ProdutosModal from "../../../components/ProdutosModal";

export default function Camera() {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(true);
  const [modalProdutos, setModalProdutos] = useState(false);
  const [produtos, setProdutos] = useState([]);

  const mockProdutos = [
  { nome: "ULTRA LED BOLINHA E27 5W", quantidade: 1, valor_compra: 593.50 },
  { nome: "ULTRA LED A60 15W", quantidade: 1, valor_compra: 871.00 },
  { nome: "Conjunto pinça emb.", quantidade: 4, valor_compra: 4200.00 },
  { nome: "Pino Guia Barra Selagem", quantidade: 20, valor_compra: 540.00 },
  { nome: "Placa Base Spreader", quantidade: 6, valor_compra: 1188.00 },
  { nome: "Trava emb. inferior", quantidade: 10, valor_compra: 1080.00 },
  { nome: "Rolete Alumínio", quantidade: 2, valor_compra: 252.00 },
  { nome: "Eixo inferior stacker", quantidade: 10, valor_compra: 270.00 },
  { nome: "Suporte Emb. linha 90", quantidade: 4, valor_compra: 216.00 },
  { nome: "Rolete esteira saída", quantidade: 10, valor_compra: 720.00 },
  { nome: "Rolete aço", quantidade: 10, valor_compra: 1080.00 },
  { nome: "Guia asa delta", quantidade: 1, valor_compra: 612.00 },
  { nome: "Hipoclorito de sódio", quantidade: 12, valor_compra: 6583.20 },
  { nome: "Rolamento 6202 ZZ", quantidade: 1, valor_compra: 17.00 },
  { nome: "Rolamento 6204 ZZ", quantidade: 1, valor_compra: 11.00 },
  { nome: "Selo mecânico tipo 21", quantidade: 1, valor_compra: 381.00 },
  { nome: "Anel Oring 160x3,5", quantidade: 1, valor_compra: 33.00 },
  { nome: "Rotor Robusta 400T", quantidade: 1, valor_compra: 296.00 },
  { nome: "Cantoneira abas iguais", quantidade: 120, valor_compra: 1470.00 },
  { nome: "Soda cáustica líquida", quantidade: 6, valor_compra: 6822.36 },
  { nome: "Fralda Personal Hiper M", quantidade: 16, valor_compra: 1661.60 },
  { nome: "Fralda Personal Jumbo G", quantidade: 47, valor_compra: 5665.85 },
  { nome: "Fralda Personal Jumbo M", quantidade: 60, valor_compra: 7233.00 },
  { nome: "Papel higiênico 30m", quantidade: 1, valor_compra: 50.53 },
  { nome: "Papel siliconado 45mm", quantidade: 149760, valor_compra: 89376.77 },
  { nome: "Cloro carreta", quantidade: 21, valor_compra: 19164.46 },
  { nome: "Areia entrega cidade", quantidade: 1, valor_compra: 420.00 },
];


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
        const produtos = response.data.produtos;
        mostrarToast("ETL realizado com sucesso!", "success");
        setModalProdutos(true);
        setProdutos(mockProdutos);
      }
      else {
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
      <ProdutosModal
        visible={modalProdutos}
        produtos={produtos}
        onClose={() => setModalProdutos(false)}
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