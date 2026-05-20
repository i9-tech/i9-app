import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal as RNModal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useCallback } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import Modal from "../../../components/Modal";
import Toast from "../../../components/Toast";
import { useTranslation } from "react-i18next";
import api from "../../../provider/api";
import { buscarUsuario, recuperarToken } from "../../../utils/storage";

// ─── Constantes ────────────────────────────────────────────────────────────────

const ETL_URL = "http://localhost:8000/upload";
const CORES = {
  primaria: "#0F14B8",
  primariaSuave: "#E8E9FF",
  fundo: "#F4F4F6",
  branco: "#FFFFFF",
  texto: "#111111",
  textoSuave: "#666666",
  borda: "#E0E0E0",
  sucesso: "#16A34A",
  sucessoSuave: "#DCFCE7",
  erro: "#DC2626",
  aviso: "#D97706",
  avisoSuave: "#FEF3C7",
  duplicata: "#7C3AED",
  duplicataSuave: "#EDE9FE",
};

// ─── Sub-componente: Dropdown simples ─────────────────────────────────────────

function Dropdown({ placeholder, opcoes, valorSelecionado, aoSelecionar, rotulo }) {
  const [aberto, setAberto] = useState(false);
  const labelSelecionado = opcoes.find((o) => o.id === valorSelecionado)?.nome;

  return (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.campo}>{rotulo}</Text>
      <Pressable
        style={[styles.dropdownBotao, aberto && styles.dropdownBotaoAberto]}
        onPress={() => setAberto((v) => !v)}
      >
        <Text style={labelSelecionado ? styles.dropdownTexto : styles.dropdownPlaceholder}>
          {labelSelecionado ?? placeholder}
        </Text>
        <Ionicons name={aberto ? "chevron-up" : "chevron-down"} size={16} color={CORES.textoSuave} />
      </Pressable>

      {aberto && (
        <View style={styles.dropdownLista}>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => { aoSelecionar(null); setAberto(false); }}
          >
            <Text style={styles.dropdownItemTextoVazio}>Nenhum</Text>
          </Pressable>
          {opcoes.map((opcao) => (
            <Pressable
              key={opcao.id}
              style={[styles.dropdownItem, opcao.id === valorSelecionado && styles.dropdownItemAtivo]}
              onPress={() => { aoSelecionar(opcao.id); setAberto(false); }}
            >
              <Text style={[styles.dropdownItemTexto, opcao.id === valorSelecionado && styles.dropdownItemTextoAtivo]}>
                {opcao.nome}
              </Text>
              {opcao.id === valorSelecionado && (
                <Ionicons name="checkmark" size={16} color={CORES.primaria} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Sub-componente: Card de produto no form ───────────────────────────────────

function ProdutoCard({ produto, indice, total, onChange, setores, categorias }) {
  const atualizar = (campo, valor) => onChange(indice, campo, valor);
  const ehDuplicata = produto.duplicata === true;

  return (
    <View style={[styles.card, ehDuplicata && styles.cardDuplicata]}>
      <View style={styles.cardCabecalho}>
        <View style={[styles.cardBadge, ehDuplicata && styles.cardBadgeDuplicata]}>
          <Text style={[styles.cardBadgeTexto, ehDuplicata && styles.cardBadgeTextoDuplicata]}>
            {indice + 1} / {total}
          </Text>
        </View>
        <Text style={styles.cardNome} numberOfLines={2}>
          {produto.nome || "Produto sem nome"}
        </Text>
      </View>

      {ehDuplicata && (
        <View style={styles.duplicataBox}>
          <Ionicons name="sync-outline" size={16} color={CORES.duplicata} />
          <Text style={styles.duplicataTexto}>
            Produto já cadastrado. A quantidade será somada ao estoque existente.
          </Text>
        </View>
      )}

      <View style={styles.linhaGrid}>
        <View style={[styles.campoBox, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.campo}>Quantidade importada</Text>
          <View style={styles.valorSomenteLeitura}>
            <Text style={styles.valorTexto}>{produto.quantidade ?? "—"}</Text>
          </View>
        </View>
        <View style={[styles.campoBox, { flex: 1 }]}>
          <Text style={styles.campo}>Preço de compra</Text>
          <View style={styles.valorSomenteLeitura}>
            <Text style={styles.valorTexto}>
              {produto.valor_compra != null
                ? `R$ ${Number(produto.valor_compra).toFixed(2)}`
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.campoBox}>
        <Text style={styles.campo}>
          Preço de venda <Text style={styles.textoSuave} color="red">
            *
          </Text>
        </Text>
        <View style={styles.inputComIcone}>
          <Text style={styles.inputPrefixo}>R$</Text>
          <TextInput
            style={styles.inputInterno}
            placeholder="0,00"
            placeholderTextColor={CORES.textoSuave}
            keyboardType="numeric"
            value={produto.preco_venda}
            onChangeText={(v) => atualizar("preco_venda", v)}
          />
        </View>
      </View>

      {!ehDuplicata && (
        <View style={styles.linhaGrid}>
          <View style={[styles.campoBox, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.campo}>Estoque mínimo</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(produto.quantidade_min ?? 10)}
              onChangeText={(v) => atualizar("quantidade_min", parseInt(v) || 0)}
            />
          </View>
          <View style={[styles.campoBox, { flex: 1 }]}>
            <Text style={styles.campo}>Estoque máximo</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(produto.quantidade_max ?? 100)}
              onChangeText={(v) => atualizar("quantidade_max", parseInt(v) || 0)}
            />
          </View>
        </View>
      )}

      <Dropdown
        rotulo="Setor"
        placeholder="Automático (primeiro disponível)"
        opcoes={setores}
        valorSelecionado={produto.setor_id}
        aoSelecionar={(v) => atualizar("setor_id", v)}
      />
      <Dropdown
        rotulo="Categoria"
        placeholder="Automática (primeira disponível)"
        opcoes={categorias}
        valorSelecionado={produto.categoria_id}
        aoSelecionar={(v) => atualizar("categoria_id", v)}
      />
    </View>
  );
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function Camera() {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(true);
  const { t } = useTranslation();

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const [modalRevisaoVisivel, setModalRevisaoVisivel] = useState(false);
  const [modalErroVisivel, setModalErroVisivel] = useState(false);

  const [produtos, setProdutos] = useState([]);
  const [setores, setSetores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  // ── Setup ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    global.setHeaderTitulo(t("camera.header_titulo"));
    global.setHeaderSubTitulo(t("camera.header_subtitulo"));
  }, [t]);

  useEffect(() => {
    buscarUsuario().then(setUsuario);
    recuperarToken().then(setToken);
  }, []);

  // ── Toast ───────────────────────────────────────────────────────────────────

  const mostrarToast = useCallback((message, type = "success") => {
    setToast({ visible: true, message, type });
    if (type !== "loading") {
      setTimeout(() => setToast({ visible: false, message: "", type }), 4000);
    }
  }, []);

  // ── Buscar setores e categorias ─────────────────────────────────────────────

  const buscarSetoresECategorias = useCallback(async () => {
    if (!usuario || !token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [resSetores, resCategorias] = await Promise.all([
        api.get(`/setores/${usuario.userId}`, { headers }),
        api.get(`/categorias/${usuario.userId}`, { headers }),
      ]);
      setSetores(resSetores.data ?? []);
      setCategorias(resCategorias.data ?? []);
    } catch {
      setSetores([]);
      setCategorias([]);
    }
  }, [usuario, token]);

  // ── Verificar duplicatas ────────────────────────────────────────────────────

  const verificarDuplicatas = useCallback(async (listaProdutos) => {
    if (!usuario || !token) return listaProdutos;
    const headers = { Authorization: `Bearer ${token}` };

    const resultados = await Promise.all(
      listaProdutos.map(async (produto) => {
        try {
          const res = await api.get(`/produtos/busca-exata/${usuario.userId}`, {
            headers,
            params: { nome: produto.nome },
          });
          const produtosEncontrados = res.data;
          if (produtosEncontrados && produtosEncontrados.length > 0) {
            return { ...produto, duplicata: true, idProdutoExistente: produtosEncontrados[0].id };
          }
          return { ...produto, duplicata: false };
        } catch {
          return { ...produto, duplicata: false };
        }
      }),
    );

    return resultados;
  }, [usuario, token]);

  // ── Inicializar estado editável de cada produto ─────────────────────────────

  const inicializarProdutos = (produtosRecebidos) =>
    produtosRecebidos.map((p) => ({
      ...p,
      preco_venda: p.preco_venda != null ? String(p.preco_venda) : "",
      quantidade_min: p.quantidade_min ?? 10,
      quantidade_max: p.quantidade_max ?? 100,
      setor_id: null,
      categoria_id: null,
      duplicata: false,
      idProdutoExistente: null,
    }));

  // ── Atualizar campo de um produto ───────────────────────────────────────────

  const atualizarProduto = useCallback((indice, campo, valor) => {
    setProdutos((prev) => {
      const copia = [...prev];
      copia[indice] = { ...copia[indice], [campo]: valor };
      return copia;
    });
  }, []);

  // ── Seleção e envio de arquivo ──────────────────────────────────────────────

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
    mostrarToast(t("camera.enviando_arquivo"), "loading");

    const formData = new FormData();
    formData.append(
      "file",
      arquivo.file ?? { uri: arquivo.uri, name: arquivo.name, type: arquivo.mimeType },
    );

    try {
      const response = await axios.post(ETL_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "sucesso") {
        const produtosRecebidos = response.data.produtos ?? [];

        if (produtosRecebidos.length === 0) {
          mostrarToast(t("camera.erro_processar"), "error");
          return;
        }

        mostrarToast("Verificando produtos existentes...", "loading");

        const produtosBase = inicializarProdutos(produtosRecebidos);

        setCarregandoDados(true);
        const [produtosComDuplicata] = await Promise.all([
          verificarDuplicatas(produtosBase),
          buscarSetoresECategorias(),
        ]);
        setCarregandoDados(false);

        setProdutos(produtosComDuplicata);

        const qtdDuplicatas = produtosComDuplicata.filter((p) => p.duplicata).length;
        const qtdNovos = produtosComDuplicata.length - qtdDuplicatas;

        const msg =
          qtdDuplicatas > 0
            ? `${qtdNovos} novo(s) + ${qtdDuplicatas} já existente(s)`
            : `${produtosRecebidos.length} produto(s) identificado(s)!`;

        mostrarToast(msg, "success");
        setTimeout(() => setModalRevisaoVisivel(true), 1500);
      } else {
        mostrarToast(t("camera.erro_processar"), "error");
        setTimeout(() => setModalErroVisivel(true), 1500);
      }
    } catch (error) {
      console.log("Erro ETL:", error.response?.data ?? error.message);
      setCarregandoDados(false);
      mostrarToast(t("camera.erro_enviar"), "error");
      setTimeout(() => setModalErroVisivel(true), 1500);
    }
  };

  // ── Confirmar e salvar produtos ─────────────────────────────────────────────

  const confirmarProdutos = async () => {
    if (!usuario || !token) {
      mostrarToast("Usuário não autenticado", "error");
      return;
    }

    setSalvando(true);
    mostrarToast("Salvando produtos...", "loading");

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const setorPadrao = setores.length > 0 ? setores[0].id : null;
    const categoriaPadrao = categorias.length > 0 ? categorias[0].id : null;

    try {
      await Promise.all(
        produtos.map(async (produto, i) => {
          const setorFinal = produto.setor_id ?? setorPadrao;
          const categoriaFinal = produto.categoria_id ?? categoriaPadrao;

          if (produto.duplicata) {
            return api.patch(
              `/produtos/quantidade/${produto.idProdutoExistente}/${usuario.userId}`,
              produto.quantidade,
              { headers: { ...headers, "Content-Type": "application/json" } },
            );
          } else {
            const body = {
              codigo: produto.codigo,
              nome: produto.nome,
              descricao: produto.descricao,
              quantidade: produto.quantidade,
              valorCompra: produto.valor_compra || 0,
              valorUnitario: produto.preco_venda
                ? parseFloat(produto.preco_venda.replace(",", "."))
                : 0,
              quantidadeMin: produto.quantidade_min || 10,
              quantidadeMax: produto.quantidade_max || 100,
              dataRegistro: produto.data_registro,
              setor: setorFinal ? { id: setorFinal } : null,
              categoria: categoriaFinal ? { id: categoriaFinal } : null,
            };
            return api.post(`/produtos/etl/${usuario.userId}`, body, { headers });
          }
        }),
      );

      setModalRevisaoVisivel(false);

      const qtdDuplicatas = produtos.filter((p) => p.duplicata).length;
      const qtdNovos = produtos.length - qtdDuplicatas;

      let msg;
      if (qtdNovos > 0 && qtdDuplicatas > 0) {
        msg = `${qtdNovos} produto(s) cadastrado(s) e ${qtdDuplicatas} estoque(s) atualizado(s)!`;
      } else if (qtdDuplicatas > 0) {
        msg = `${qtdDuplicatas} estoque(s) atualizado(s) com sucesso!`;
      } else {
        msg = `${qtdNovos} produto(s) cadastrado(s) com sucesso!`;
      }

      mostrarToast(msg, "success");
    } catch (error) {
      console.log("Erro ao salvar:", error.response?.data ?? error.message);
      mostrarToast("Erro ao salvar um ou mais produtos", "error");
    } finally {
      setSalvando(false);
    }
  };

  // ── Permissão de câmera ─────────────────────────────────────────────────────

  if (!permissao) return <View style={styles.safe} />;

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

  // ── Contadores para o header do modal ──────────────────────────────────────

  const qtdDuplicatasModal = produtos.filter((p) => p.duplicata).length;
  const qtdNovosModal = produtos.length - qtdDuplicatasModal;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.safe}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      {/* ── Modal de revisão de produtos ── */}
      <RNModal
        visible={modalRevisaoVisivel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalRevisaoVisivel(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitulo}>Revisar produtos</Text>
              <View style={styles.modalContadores}>
                {qtdNovosModal > 0 && (
                  <View style={styles.contadorBadge}>
                    <Ionicons name="add-circle-outline" size={13} color={CORES.sucesso} />
                    <Text style={[styles.contadorTexto, { color: CORES.sucesso }]}>
                      {qtdNovosModal} novo(s)
                    </Text>
                  </View>
                )}
                {qtdDuplicatasModal > 0 && (
                  <View style={[styles.contadorBadge, { backgroundColor: CORES.duplicataSuave }]}>
                    <Ionicons name="sync-outline" size={13} color={CORES.duplicata} />
                    <Text style={[styles.contadorTexto, { color: CORES.duplicata }]}>
                      {qtdDuplicatasModal} já existente(s)
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable
              style={styles.modalFechar}
              onPress={() => setModalRevisaoVisivel(false)}
            >
              <Ionicons name="close" size={22} color={CORES.texto} />
            </Pressable>
          </View>

          <View style={styles.avisoBox}>
            <Ionicons name="information-circle-outline" size={16} color={CORES.aviso} />
            <Text style={styles.avisoTexto}>
              Preencha: preço de venda, setor e categoria. Caso deixe em branco, serão atribuídos automaticamente.
            </Text>
          </View>

          {carregandoDados ? (
            <View style={styles.centrado}>
              <ActivityIndicator size="large" color={CORES.primaria} />
              <Text style={styles.carregandoTexto}>Verificando produtos...</Text>
            </View>
          ) : (
            <FlatList
              data={produtos}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.listaConteudo}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <ProdutoCard
                  produto={item}
                  indice={index}
                  total={produtos.length}
                  onChange={atualizarProduto}
                  setores={setores}
                  categorias={categorias}
                />
              )}
            />
          )}

          <View style={styles.modalRodape}>
            <Pressable
              style={[styles.botaoPrimario, salvando && styles.botaoDesabilitado]}
              onPress={confirmarProdutos}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={[styles.botaoPrimarioTexto, { marginLeft: 8 }]}>
                    Confirmar {produtos.length} produto(s)
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </RNModal>

      {/* ── Modal de erro ── */}
      <RNModal
        visible={modalErroVisivel}
        animationType="fade"
        transparent
        onRequestClose={() => setModalErroVisivel(false)}
      >
        <View style={styles.modalErroOverlay}>
          <View style={styles.modalErroBox}>
            <Ionicons name="warning-outline" size={48} color={CORES.erro} />
            <Text style={styles.modalErroTitulo}>Erro na leitura</Text>
            <Text style={styles.modalErroTexto}>
              Alguns produtos da nota fiscal não puderam ser identificados.
              Verifique o arquivo e tente novamente.
            </Text>
            <Pressable style={styles.botaoPrimario} onPress={() => setModalErroVisivel(false)}>
              <Text style={styles.botaoPrimarioTexto}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </RNModal>

      {/* ── Tela principal ── */}
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
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={
            escaneado
              ? undefined
              : ({ type, data }) => {
                  setEscaneado(true);
                  mostrarToast(t("camera.dados_nota", { data }), "success");
                }
          }
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

// ─── Estilos ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F6",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: { marginBottom: 25 },
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

  // ── Botão primário (modal) ──
  botaoPrimario: {
    backgroundColor: "#0F14B8",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoPrimarioTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
  botaoDesabilitado: { opacity: 0.6 },

  // ── Modal de revisão ──
  modalContainer: { flex: 1, backgroundColor: "#F4F4F6" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitulo: { fontSize: 18, fontWeight: "700", color: "#111111", marginBottom: 6 },
  modalContadores: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  contadorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  contadorTexto: { fontSize: 12, fontWeight: "600" },
  modalFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avisoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  avisoTexto: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18 },
  listaConteudo: { padding: 16, paddingBottom: 8 },
  modalRodape: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  carregandoTexto: { marginTop: 12, fontSize: 14, color: "#666666" },

  // ── Card de produto ──
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cardDuplicata: { borderColor: "#7C3AED", borderWidth: 1.5 },
  cardCabecalho: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 10 },
  cardBadge: {
    backgroundColor: "#E8E9FF",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 48,
    alignItems: "center",
  },
  cardBadgeDuplicata: { backgroundColor: "#EDE9FE" },
  cardBadgeTexto: { fontSize: 12, fontWeight: "700", color: "#0F14B8" },
  cardBadgeTextoDuplicata: { color: "#7C3AED" },
  cardNome: { flex: 1, fontSize: 15, fontWeight: "700", color: "#111111", lineHeight: 20 },
  duplicataBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EDE9FE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  duplicataTexto: { flex: 1, fontSize: 13, color: "#7C3AED", lineHeight: 18 },
  linhaGrid: { flexDirection: "row", marginBottom: 12 },
  campoBox: { marginBottom: 12 },
  campo: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textoSuave: { color: "#666666", fontWeight: "400", textTransform: "none" },
  valorSomenteLeitura: { backgroundColor: "#F4F4F6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  valorTexto: { fontSize: 14, color: "#111111" },
  input: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111111",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  inputComIcone: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0F14B8",
    paddingHorizontal: 12,
  },
  inputPrefixo: { fontSize: 14, color: "#666666", marginRight: 6 },
  inputInterno: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#111111" },

  // ── Dropdown ──
  dropdownWrapper: { marginBottom: 12 },
  dropdownBotao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownBotaoAberto: { borderColor: "#0F14B8" },
  dropdownTexto: { fontSize: 14, color: "#111111" },
  dropdownPlaceholder: { fontSize: 14, color: "#666666" },
  dropdownLista: {
    marginTop: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F6",
  },
  dropdownItemAtivo: { backgroundColor: "#E8E9FF" },
  dropdownItemTexto: { fontSize: 14, color: "#111111" },
  dropdownItemTextoAtivo: { color: "#0F14B8", fontWeight: "600" },
  dropdownItemTextoVazio: { fontSize: 14, color: "#666666", fontStyle: "italic" },

  // ── Modal de erro ──
  modalErroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalErroBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  modalErroTitulo: { fontSize: 18, fontWeight: "700", color: "#111111" },
  modalErroTexto: { fontSize: 14, color: "#666666", textAlign: "center", lineHeight: 20 },
});