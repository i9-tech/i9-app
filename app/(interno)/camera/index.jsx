import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import Modalcentro from "../../../components/Modalcentro";
import Toast from "../../../components/Toast";
import api from "../../../provider/api";
import { buscarUsuario, recuperarToken } from "../../../utils/storage";

export default function Camera() {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalPermissaoVisivel, setModalPermissaoVisivel] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const [modalProdutosVisivel, setModalProdutosVisivel] = useState(false);
  const [modalErroVisivel, setModalErroVisivel] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [precoVenda, setPrecoVenda] = useState({});

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    global.setHeaderTitulo("Câmera");
    global.setHeaderSubTitulo(
      "Escaneie a nota fiscal para adicionar os produtos",
    );
  }, []);

  useEffect(() => {
    buscarUsuario().then((dados) => setUsuario(dados));
    recuperarToken().then((t) => setToken(t));
  }, []);

  const mostrarToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    if (type !== "loading") {
      setTimeout(() => {
        setToast({ visible: false, message: "", type });
      }, 4000);
    }
  };

  if (!permissao) return <View style={styles.safe} />;

  if (!permissao.granted && modalPermissaoVisivel) {
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
              setModalPermissaoVisivel(false);
            }}
          >
            <Text style={styles.textoBotaoPrincipal}>Conceder Permissão</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  const aoEscanearCodigo = ({ type, data }) => {
    setEscaneado(true);
    mostrarToast(`Dados da Nota: ${data}`, "success");
  };

  const selecionarArquivo = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "application/vnd.ms-excel.sheet.macroEnabled.12",
        "text/csv",
      ],
    });
    if (resultado.canceled) return;
    enviarArquivo(resultado.assets[0]);
  };

  const enviarArquivo = async (arquivo) => {
    mostrarToast("Enviando arquivo...", "loading");

    const formData = new FormData();
    formData.append("file", arquivo.file);

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData,
      );

      console.log("RESPOSTA:", JSON.stringify(response.data));

      if (response.data.status === "sucesso") {
        mostrarToast("ETL realizado com sucesso!", "success");

        const produtosRecebidos = response.data.produtos || [];
        setProdutos(produtosRecebidos);

        // inicializa preços de venda vazios
        const precos = {};
        produtosRecebidos.forEach((_, i) => {
          precos[i] = "";
        });
        setPrecoVenda(precos);

        setTimeout(() => {
          setModalProdutosVisivel(true);
        }, 1500);
      } else {
        mostrarToast("Erro ao processar arquivo", "error");
        setTimeout(() => {
          setModalErroVisivel(true);
        }, 1500);
      }
    } catch (error) {
      console.log("ERRO REAL:", error.response?.data);
      mostrarToast("Erro ao enviar arquivo", "error");
      setTimeout(() => {
        setModalErroVisivel(true);
      }, 1500);
    }
  };

  const confirmarProdutos = async () => {
    if (!usuario || !token) {
      mostrarToast("Usuário não autenticado", "error");
      return;
    }

    try {
      mostrarToast("Salvando produtos...", "loading");

      await Promise.all(
        produtos.map((produto, index) =>
          api.patch(
            `/produtos/preco-venda/${produto.id}/${usuario.userId}`,
            parseFloat(precoVenda[index]) || 0,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          ),
        ),
      );

      setModalProdutosVisivel(false);
      mostrarToast("Produtos confirmados!", "success");
    } catch (error) {
      console.log("ERRO ao confirmar:", error.response?.data);
      mostrarToast("Erro ao salvar produtos", "error");
    }
  };

  return (
    <View style={styles.safe}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      {modalProdutosVisivel && (
        <Modalcentro
          titulo="Produtos identificados"
          onClose={() => setModalProdutosVisivel(false)}
        >
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {produtos.map((produto, index) => (
              <View key={index} style={styles.produtoCard}>
                <View style={styles.produtoCampo}>
                  <Text style={styles.produtoLabel}>Nome:</Text>
                  <View style={styles.produtoValorBox}>
                    <Text style={styles.produtoValor}>
                      {produto.nome || "Produto não identificado"}
                    </Text>
                  </View>
                </View>

                <View style={styles.produtoCampo}>
                  <Text style={styles.produtoLabel}>Quantidade:</Text>
                  <View style={styles.produtoValorBox}>
                    <Text style={styles.produtoValor}>
                      {produto.quantidade ?? "Digite a quantidade"}
                    </Text>
                  </View>
                </View>

                <View style={styles.produtoCampo}>
                  <Text style={styles.produtoLabel}>Preço compra:</Text>
                  <View style={styles.produtoValorBox}>
                    <Text style={styles.produtoValor}>
                      {produto.valor_compra != null
                        ? `R$ ${Number(produto.valor_compra).toFixed(2)}`
                        : "Digite o preço de compra"}
                    </Text>
                  </View>
                </View>

                <View style={styles.produtoCampo}>
                  <Text style={styles.produtoLabel}>Preço venda:</Text>
                  <TextInput
                    style={styles.produtoInput}
                    placeholder="Digite o preço de venda"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    value={precoVenda[index]}
                    onChangeText={(text) =>
                      setPrecoVenda((prev) => ({ ...prev, [index]: text }))
                    }
                  />
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable style={styles.botaoPrincipal} onPress={confirmarProdutos}>
            <Text style={styles.textoBotaoPrincipal}>Confirmar Produtos</Text>
          </Pressable>
        </Modalcentro>
      )}

      {modalErroVisivel && (
        <Modalcentro
          titulo="⚠️ Erro na leitura"
          onClose={() => setModalErroVisivel(false)}
        >
          <View style={styles.modalErroContent}>
            <Text style={styles.textoErro}>
              Alguns produtos da nota fiscal não puderam ser identificados
            </Text>
            <Pressable
              style={styles.botaoPrincipal}
              onPress={() => setModalErroVisivel(false)}
            >
              <Text style={styles.textoBotaoPrincipal}>
                Revisar informações
              </Text>
            </Pressable>
          </View>
        </Modalcentro>
      )}

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
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
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
  header: { marginBottom: 25 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  titulo: { fontSize: 18, fontWeight: "bold", color: "#111", marginLeft: 10 },
  subtitulo: { fontSize: 15, color: "#333", lineHeight: 22, fontWeight: "500" },
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

  // MODAL PERMISSÃO
  modalContent: { paddingVertical: 10, alignItems: "center" },
  textoPermissaoModal: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },

  // MODAL ERRO
  modalErroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  textoErro: {
    fontSize: 15,
    color: "#444",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },

  // CARD PRODUTO
  produtoCard: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEBEB",
    paddingBottom: 15,
  },
  produtoCampo: { marginBottom: 8 },
  produtoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  produtoValorBox: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  produtoValor: { fontSize: 14, color: "#555" },
  produtoInput: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111",
  },

  // BOTÕES
  botaoPrincipal: {
    backgroundColor: "#0F14B8",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  textoBotaoPrincipal: { color: "white", fontSize: 16, fontWeight: "600" },

  // UPLOAD
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
  uploadSubtitle: { fontSize: 13, color: "#666", marginTop: 4 },
});
