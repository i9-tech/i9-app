import { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { WebView } from "react-native-webview";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import axios from "axios";
import api from "../../../provider/api";
import CustomModal from "../../../components/ModalOCR";
import Toast from "../../../components/Toast";
import ModalRevisaoETL from "../../../components/ModalRevisaoETL";
import DropdownInterativo from "../../../components/Dropdown";
import { recuperarToken, buscarUsuario } from "../../../utils/storage";
import { ENDPOINTS } from "../../../utils/endpoints";

const ETL_URL = "http://localhost:8000/upload";

export default function Camera() {
  const { t } = useTranslation();
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(true);

  const [urlConsulta, setUrlConsulta] = useState(null);
  const [chaveAtual, setChaveAtual] = useState(null);
  const webViewRef = useRef(null);
  const [itensNota, setItensNota] = useState([]);
  const [modalItensVisivel, setModalItensVisivel] = useState(false);

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

  useEffect(() => {
    global.setHeaderTitulo(t("camera.header_titulo"));
    global.setHeaderSubTitulo(t("camera.header_subtitulo"));
  }, [t]);

  useEffect(() => {
    async function carregarDados() {
      const user = await buscarUsuario();
      const tkn = await recuperarToken();
      setUsuario(user);
      setToken(tkn);
    }
    carregarDados();
  }, []);

  const mostrarToast = useCallback((message, type = "success") => {
    setToast({ visible: true, message, type });
    if (type !== "loading") {
      setTimeout(() => setToast({ visible: false, message: "", type: "success" }), 4000);
    }
  }, []);

  const extrairChNFe = (data) => {
    try {
      const texto = String(data);
      const chave44 = texto.match(/\d{44}/);
      if (chave44) return chave44[0];
      if (texto.includes("p=")) return texto.split("p=")[1].split("|")[0];
      if (texto.includes("chNFe=")) return texto.split("chNFe=")[1].split("&")[0];
      return null;
    } catch {
      return null;
    }
  };

  const formatarDinheiro = (valor) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(valor || 0));

  const formatarMoedaInput = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");
    const numero = Number(apenasNumeros) / 100;
    return numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalGeral = itensNota.reduce(
    (acc, item) => acc + Number(item.valorUnitario || 0) * Number(item.quantidade || 0),
    0
  );

  const atualizarItemNota = (index, campo, novoTexto) => {
    const copia = [...itensNota];
    copia[index][campo] = novoTexto;
    setItensNota(copia);
  };

  const aoEscanearCodigo = async ({ data }) => {
    try {
      if (escaneado) return;
      setEscaneado(true);
      const texto = String(data).trim();

      if (texto.length === 13 && /^\d+$/.test(texto)) {
        mostrarToast("Produto identificado: " + texto, "success");
        return;
      }

      const chave = extrairChNFe(texto);
      if (!chave) {
        mostrarToast(t("camera.qr_invalido"), "error");
        return;
      }

      const url = `https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?nfe=${chave}`;
      setChaveAtual(chave);
      setUrlConsulta(url);
    } catch {
      mostrarToast(t("camera.erro_abrir_consulta"), "error");
    } finally {
      setTimeout(() => setEscaneado(false), 3000);
    }
  };

  const processarHTML = async (html) => {
    try {
      mostrarToast(t("camera.processando_nota"), "loading");
      const tkn = await recuperarToken();
      const response = await api.post(
        "/nfce/processar-html",
        { html, chNFe: chaveAtual },
        { headers: { Authorization: `Bearer ${tkn}` } }
      );
      const itens = (response.data?.itens || []).map((item) => ({
        ...item,
        nome: item.nome || (item.descricao ? item.descricao.trim().split(" ")[0] : ""),
      }));
      setItensNota(itens);
      if (itens.length > 0) setModalItensVisivel(true);
      mostrarToast(t("camera.nota_processada"), "success");
      setUrlConsulta(null);
    } catch {
      mostrarToast(t("camera.erro_processar"), "error");
    }
  };

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
          const encontrados = res.data;
          if (encontrados && encontrados.length > 0) {
            return { ...produto, duplicata: true, idProdutoExistente: encontrados[0].id };
          }
          return { ...produto, duplicata: false };
        } catch {
          return { ...produto, duplicata: false };
        }
      }),
    );
    return resultados;
  }, [usuario, token]);

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

  const atualizarProduto = useCallback((indice, campo, valor) => {
    setProdutos((prev) => {
      const copia = [...prev];
      copia[indice] = { ...copia[indice], [campo]: valor };
      return copia;
    });
  }, []);

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
        produtos.map(async (produto) => {
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

  if (!permissao) return <View style={styles.safe} />;

  if (!permissao.granted && modalVisivel) {
    return (
      <CustomModal titulo={t("camera.permissao_titulo")}>
        <View style={styles.modalContent}>
          <Text style={styles.textoPermissaoModal}>{t("camera.permissao_texto")}</Text>
          <Pressable
            style={styles.botaoPrincipal}
            onPress={() => { solicitarPermissao(); setModalVisivel(false); }}
          >
            <Text style={styles.textoBotaoPrincipal}>{t("camera.conceder_permissao")}</Text>
          </Pressable>
        </View>
      </CustomModal>
    );
  }

  return (
    <View style={styles.safe}>
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />

      <RNModal
        visible={urlConsulta !== null}
        animationType="slide"
        onRequestClose={() => setUrlConsulta(null)}
      >
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <WebView
            ref={webViewRef}
            source={{ uri: urlConsulta }}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            startInLoadingState
            onNavigationStateChange={(navState) => {
              const urlLower = navState.url.toLowerCase();
              if (urlLower.includes("consulta") && !urlLower.includes("consultarecaptcha")) {
                setTimeout(() => {
                  webViewRef.current?.injectJavaScript(`
                    window.ReactNativeWebView.postMessage(document.documentElement.outerHTML);
                    true;
                  `);
                }, 1000);
              }
            }}
            onMessage={async (event) => {
              await processarHTML(event.nativeEvent.data);
            }}
          />
        </View>
      </RNModal>

      {modalItensVisivel && (
        <CustomModal
          titulo="Confirmar Produtos da Nota"
          modalStyle={{
            width: "100%",
            height: "90%",
            maxHeight: "90%",
            borderRadius: 28,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            paddingHorizontal: 18,
            paddingTop: 18,
            paddingBottom: 24,
          }}
        >
          <View style={{ width: "100%", flex: 1 }}>
            <View style={{ paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#F1F1F4", marginBottom: 12 }}>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#1C1C1E", letterSpacing: -0.8 }}>
                Revisar Produtos
              </Text>
              <Text style={{ marginTop: 4, fontSize: 13, color: "#8E8E93", lineHeight: 18 }}>
                Edite os produtos, ajuste os preços e organize os itens no estoque.
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {itensNota.map((item, index) => {
                const totalItem = Number(item.valorUnitario || 0) * Number(item.quantidade || 0);
                const qtd = Number(item.quantidade || 0);

                return (
                  <View
                    key={index}
                    style={{
                      backgroundColor: "#FFFFFF", borderRadius: 26, padding: 18, marginBottom: 18,
                      borderWidth: 1.5, borderColor: "#E3E5EC",
                      shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 3,
                    }}
                  >
                    {item.codigoProduto ? (
                      <View style={{
                        alignSelf: "flex-start", backgroundColor: "#FAFAFC", borderRadius: 999,
                        borderWidth: 1, borderColor: "#ECECF2", paddingHorizontal: 10, paddingVertical: 6,
                        marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 8,
                      }}>
                        <Ionicons name="barcode-outline" size={12} color="#0F14B8" />
                        <TextInput
                          value={item.codigoProduto || ""}
                          onChangeText={(text) => atualizarItemNota(index, "codigoProduto", text)}
                          placeholder="Digite um código..."
                          placeholderTextColor="#A9A9B0"
                          style={{ color: "#0F14B8", fontSize: 11, fontWeight: "800", letterSpacing: 0.3 }}
                        />
                        <Ionicons name="create-outline" size={18} color="#B8B8C2" />
                      </View>
                    ) : null}

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <View style={{ flex: 1, backgroundColor: "#F8F9FC", borderRadius: 18, borderWidth: 1, borderColor: "#E7E9F2", paddingHorizontal: 14, minHeight: 58, flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="cube-outline" size={18} color="#8E8E93" style={{ marginRight: 8 }} />
                        <TextInput
                          value={item.nome || ""}
                          onChangeText={(text) => atualizarItemNota(index, "nome", text)}
                          placeholder="Nome do produto"
                          placeholderTextColor="#A9A9B0"
                          style={{ flex: 1, fontSize: 15, fontWeight: "700", color: "#1C1C1E", paddingVertical: 0 }}
                        />
                        <Ionicons name="create-outline" size={18} color="#B8B8C2" />
                      </View>
                      <View style={{ width: 118, minHeight: 58, backgroundColor: "#0F14B8", borderRadius: 18, justifyContent: "center", paddingHorizontal: 10, paddingVertical: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginBottom: 6 }}>
                          <Text style={{ color: "#C7CBFF", fontSize: 10, fontWeight: "800", letterSpacing: 0.7 }}>TOTAL</Text>
                          <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)", justifyContent: "center", alignItems: "center" }}>
                            <Ionicons name="lock-closed" size={9} color="#FFFFFF" />
                          </View>
                        </View>
                        <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "900", textAlign: "center" }} numberOfLines={1} adjustsFontSizeToFit>
                          {formatarDinheiro(totalItem)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
                      <View style={{ flex: 1, backgroundColor: "#d4d4d48a", padding: 14, borderRadius: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                          <Text style={{ fontSize: 11, color: "#8E8E93", fontWeight: "700" }}>CUSTO UNITÁRIO</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#bfc3cafe", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 }}>
                            <Ionicons name="lock-closed" size={9} color="#434343" style={{ marginRight: 4 }} />
                            <Text style={{ fontSize: 9, color: "#5F6368", fontWeight: "800", letterSpacing: 0.3 }}>Não editavel</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 15, color: "#1C1C1E", fontWeight: "800" }}>{formatarDinheiro(item.valorUnitario)}</Text>
                      </View>
                      <View style={{ width: 120, backgroundColor: "#d4d4d48a", padding: 14, borderRadius: 16 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                          <Text style={{ fontSize: 11, color: "#8E8E93", fontWeight: "700" }}>QUANTIDADE</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#bfc3cafe", paddingHorizontal: 3, paddingVertical: 3, borderRadius: 999 }}>
                            <Ionicons name="lock-closed" size={9} color="#434343" />
                          </View>
                        </View>
                        <Text style={{ fontSize: 15, color: "#1C1C1E", fontWeight: "800" }}>{qtd} un.</Text>
                      </View>
                    </View>

                    <View style={{ marginTop: 18 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#636366", marginBottom: 8, letterSpacing: 0.4 }}>DESCRIÇÃO</Text>
                      <View style={{ backgroundColor: "#FAFAFC", borderRadius: 18, borderWidth: 1, borderColor: "#ECECF2", paddingHorizontal: 14, paddingVertical: 12, position: "relative" }}>
                        <TextInput
                          value={item.descricao || ""}
                          onChangeText={(text) => atualizarItemNota(index, "descricao", text)}
                          placeholder="Digite uma descrição detalhada..."
                          placeholderTextColor="#A9A9B0"
                          multiline
                          style={{ minHeight: 70, textAlignVertical: "top", color: "#3A3A3C", fontSize: 14, lineHeight: 20, paddingRight: 34 }}
                        />
                        <Ionicons name="create-outline" size={18} color="#B8B8C2" style={{ position: "absolute", top: 14, right: 14 }} />
                      </View>
                    </View>

                    <View style={{ marginTop: 18 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#636366", marginBottom: 8, letterSpacing: 0.4 }}>PREÇO DE VENDA</Text>
                      <View style={{ backgroundColor: "#FAFAFC", borderRadius: 18, borderWidth: 1, borderColor: "#E7E9F2", paddingHorizontal: 16, flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontSize: 20, fontWeight: "800", color: "#0F14B8", marginRight: 8 }}>R$</Text>
                        <TextInput
                          value={item.valorVenda || ""}
                          placeholder="0,00"
                          placeholderTextColor="#B8B8C2"
                          keyboardType="numeric"
                          onChangeText={(text) => atualizarItemNota(index, "valorVenda", formatarMoedaInput(text))}
                          style={{ flex: 1, fontSize: 20, color: "#1C1C1E", fontWeight: "700", paddingVertical: 15 }}
                        />
                      </View>
                    </View>

                    <View style={{ marginTop: 20 }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: "#636366", marginBottom: 10, letterSpacing: 0.4 }}>ORGANIZAÇÃO DO ESTOQUE</Text>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ flex: 1 }}>
                          <DropdownInterativo
                            label={t("estoque.todos_setores")}
                            options={[{ id: null, nome: t("estoque.todos_setores") }, ...setores]}
                            onSelect={(valor) => atualizarItemNota(index, "setorId", valor.id)}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <DropdownInterativo
                            label={t("estoque.todas_categorias")}
                            options={[{ id: null, nome: t("estoque.todas_categorias") }, ...categorias]}
                            onSelect={(valor) => atualizarItemNota(index, "categoriaId", valor.id)}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}

              <View style={{ backgroundColor: "#0F14B8", borderRadius: 28, padding: 22, marginTop: 6 }}>
                <Text style={{ color: "#C7CBFF", fontSize: 12, fontWeight: "700", marginBottom: 6, letterSpacing: 0.5 }}>TOTAL GERAL</Text>
                <Text style={{ color: "#FFFFFF", fontSize: 34, fontWeight: "900", letterSpacing: -1.5 }}>{formatarDinheiro(totalGeral)}</Text>
              </View>

              <Pressable
                style={({ pressed }) => ({
                  marginTop: 18, backgroundColor: "#0F14B8", paddingVertical: 18, borderRadius: 22,
                  alignItems: "center", justifyContent: "center", opacity: pressed ? 0.9 : 1,
                  shadowColor: "#0F14B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 5,
                })}
                onPress={async () => {
                  try {
                    const payload = itensNota.map((item) => ({
                      codigoProduto: item.codigoProduto || null,
                      nome: item.nome || "",
                      descricao: item.descricao || "",
                      quantidade: Number(item.quantidade || 0),
                      valorUnitario: Number(item.valorUnitario || 0),
                      valorVenda: Number(String(item.valorVenda || "0").replace(/\./g, "").replace(",", ".")),
                      setorId: item.setorId || null,
                      categoriaId: item.categoriaId || null,
                    }));

                    await api.post("/estoque/importar-nota", payload, {
                      headers: { Authorization: `Bearer ${token}` },
                    });

                    mostrarToast("Produtos salvos com sucesso", "success");
                    setModalItensVisivel(false);
                    setItensNota([]);
                  } catch {
                    mostrarToast("Erro ao salvar produtos", "error");
                  }
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "800", letterSpacing: 0.2 }}>Confirmar e Avançar</Text>
                </View>
              </Pressable>
            </ScrollView>
          </View>
        </CustomModal>
      )}

      <ModalRevisaoETL
        visivel={modalRevisaoVisivel}
        onFechar={() => setModalRevisaoVisivel(false)}
        erroVisivel={modalErroVisivel}
        onFecharErro={() => setModalErroVisivel(false)}
        produtos={produtos}
        onAtualizarProduto={atualizarProduto}
        setores={setores}
        categorias={categorias}
        carregando={carregandoDados}
        salvando={salvando}
        onConfirmar={confirmarProdutos}
      />

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
          onBarcodeScanned={
            escaneado || urlConsulta || modalItensVisivel
              ? undefined
              : aoEscanearCodigo
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F4F6", paddingHorizontal: 20, paddingTop: 30 },
  header: { marginBottom: 25 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  titulo: { fontSize: 18, fontWeight: "bold", color: "#111", marginLeft: 10 },
  subtitulo: { fontSize: 15, color: "#333", lineHeight: 22, fontWeight: "500" },
  cameraContainer: {
    flex: 1, width: "100%", backgroundColor: "#000", borderRadius: 20, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, marginBottom: 30,
  },
  modalContent: { paddingVertical: 10, alignItems: "center" },
  textoPermissaoModal: { fontSize: 16, color: "#444", textAlign: "center", lineHeight: 24, marginBottom: 25 },
  botaoPrincipal: { backgroundColor: "#0F14B8", paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, width: "100%", alignItems: "center" },
  textoBotaoPrincipal: { color: "white", fontSize: 16, fontWeight: "600" },
  uploadBox: {
    borderWidth: 1.5, borderStyle: "dashed", borderColor: "#0F14B8", borderRadius: 16,
    paddingVertical: 25, alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFF", bottom: 10,
  },
  uploadTitle: { marginTop: 10, fontSize: 16, fontWeight: "600", color: "#0F14B8" },
  uploadSubtitle: { fontSize: 13, color: "#666", marginTop: 4 },
});