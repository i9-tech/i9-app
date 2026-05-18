import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Tabela from "../../../components/Tabela";
import DropdownInterativo from "../../../components/Dropdown";
import { useEffect, useState } from "react";
import api from "../../../provider/api";
import { ENDPOINTS } from "../../../utils/endpoints";
import { buscarUsuario, recuperarToken } from "../../../utils/storage";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Estoque() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    global.setHeaderTitulo(t("estoque.header_titulo"));
    global.setHeaderSubTitulo(t("estoque.header_subtitulo_carregando"));
  }, [t]);

  global.onPressAddEstoque = () => {
    router.push("/estoque/form");
  };

  const [setorSelecionado, setSetorSelecionado] = useState(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);

  const [setores, setSetores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const [menuAberto, setMenuAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [ordem] = useState("asc");
  const [termoBusca, setTermoBusca] = useState("");
  const [produtos, setProdutos] = useState([]);

  const [totalPaginas, setTotalPaginas] = useState(0);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const [quantidadeProdutosEmEstoque, setQuantidadeTotalProdutosEmEstoque] = useState(0);
  const [valorEstoque, setValorEstoque] = useState(0);
  const [lucroBruto, setLucroBruto] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [semEstoque, setSemEstoque] = useState(0);

  const aplicarFiltro = (status) => {
    setFiltroStatus(status);
    setMenuAberto(false);
    setPaginaAtual(0);
  };

  const textoFiltro =
    filtroStatus === "baixo" ? (
      t("estoque.filtro_baixo")
    ) : filtroStatus === "sem" ? (
      t("estoque.filtro_sem")
    ) : (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="search" size={18} color="#333" />
        <Text style={{ marginLeft: 5 }}>{t("estoque.filtros")}</Text>
      </View>
    );

  useEffect(() => {
    buscarUsuario().then((dados) => setUsuario(dados));
    recuperarToken().then((t) => setToken(t));
  }, []);

  useEffect(() => {
    if (!usuario || !token) return;

    api.get(`${ENDPOINTS.PRODUTOS_QUANTIDADE_DIFERENTE}/${usuario.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        global.setHeaderSubTitulo(t("estoque.header_subtitulo_itens", { total: res.data }));
      })
      .catch((err) => console.error("Erro no Header:", err));

    api.get(`${ENDPOINTS.SETORES}/${usuario.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setSetores(res.data));

    api.get(`${ENDPOINTS.CATEGORIAS}/${usuario.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setCategorias(res.data));

  }, [usuario, token, t]);

  useEffect(() => {
    if (!usuario || !token) return;

    const termoSemAcento = (termoBusca || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    api.get(`${ENDPOINTS.PRODUTOS_PAGINADO}/${usuario.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        pagina: paginaAtual,
        quantidadePorPagina: itensPorPagina,
        ordem,
        termoBusca: termoSemAcento,
        statusEstoque: filtroStatus,
        categoriaId: categoriaSelecionada?.id,
        setorId: setorSelecionado?.id,
      },
    })
      .then((res) => {
        setProdutos(res.data.content);
        setTotalPaginas(res.data.totalPages);
      })
      .catch((err) => console.error(err));

  }, [
    usuario,
    token,
    paginaAtual,
    termoBusca,
    filtroStatus,
    categoriaSelecionada,
    setorSelecionado,
    itensPorPagina,
  ]);

  useEffect(() => {
    if (!usuario || !token) return;

    api.get(`${ENDPOINTS.PRODUTOS_QUANTIDADE_ESTOQUE}/${usuario.userId}`, { headers: { Authorization: `Bearer ${token}` }, })
      .then((res) => setQuantidadeTotalProdutosEmEstoque(res.data))
      .catch((err) => {
        console.error(err);
        toast.error(t("estoque.erro_qtd_estoque"));
      });

    api.get(`${ENDPOINTS.PRODUTOS_COMPRA}/${usuario.userId}`, { headers: { Authorization: `Bearer ${token}` }, })
      .then((res) => setValorEstoque(res.data))
      .catch((err) => {
        console.error(err);
        toast.error(t("estoque.erro_valor_compra"));
      });

    api.get(`${ENDPOINTS.PRODUTOS_LUCRO_BRUTO}/${usuario.userId}`, { headers: { Authorization: `Bearer ${token}` }, })
      .then((res) => setLucroBruto(res.data))
      .catch((err) => {
        console.error(err);
        toast.error(t("estoque.erro_lucro_bruto"));
      });

    api.get(`${ENDPOINTS.PRODUTOS_LUCRO_LIQUIDO}/${usuario.userId}`, { headers: { Authorization: `Bearer ${token}` }, })
      .then((res) => setLucroLiquido(res.data))
      .catch((err) => {
        console.error(err);
        toast.error(t("estoque.erro_lucro_liquido"));
      });

    api.get(`${ENDPOINTS.PRODUTOS_ESTOQUE_BAIXO}/${usuario.userId}`, { headers: { Authorization: `Bearer ${token}` }, })
      .then((res) => setEstoqueBaixo(res.data))
      .catch((err) => {
        console.error(err);
        toast.error(t("estoque.erro_estoque_baixo"));
      });

    api.get(`${ENDPOINTS.PRODUTOS_SEM_ESTOQUE}/${usuario.userId}`, { headers: { Authorization: `Bearer ${token}` }, })
      .then((res) => setSemEstoque(res.data))
      .catch((err) => {
        console.error(err);
        toast.error(t("estoque.erro_sem_estoque"));
      });

  }, [usuario, token, t]);

  const handleEditarProduto = (produto) => {
    router.push({
      pathname: "/estoque/form",
      params: { 
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome,
        quantidade: produto.quantidade,
        valorCompra: produto.valorCompra,
        valorUnitario: produto.valorUnitario,
        quantidadeMin: produto.quantidadeMin,
        quantidadeMax: produto.quantidadeMax,
        descricao: produto.descricao,
        setorId: produto.setor?.id,
        setorNome: produto.setor?.nome,
        categoriaId: produto.categoria?.id,
        categoriaNome: produto.categoria?.nome
      }
    });
  };

  const handleDeleteProduto = async (id, nome) => {
    try {
      await executarComToast(
        () =>
          api.delete(
            `${ENDPOINTS.PRODUTOS}/${id}/${usuario.userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        {
          loadingMsg: t("estoque.excluindo", { nome }),
          successMsg: t("estoque.excluido_sucesso", { nome }),
          errorMsg: t("estoque.erro_excluir", { nome }),
          onSuccess: () => {
            setProdutos((prev) => prev.filter((p) => p.id !== id));

            api.get(`${ENDPOINTS.PRODUTOS_QUANTIDADE_DIFERENTE}/${usuario.userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then((res) => {
                global.setHeaderSubTitulo(t("estoque.header_subtitulo_itens", { total: res.data }));
              })
              .catch((err) => console.error("Erro ao atualizar Header após delete:", err));
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <TextInput
              placeholder={t("estoque.procurar_produto")}
              style={styles.searchInput}
              value={termoBusca}
              onChangeText={(text) => {
                setTermoBusca(text);
                setPaginaAtual(0);
              }}
            />

            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setMenuAberto(!menuAberto)}
            >
              <Text style={styles.filterText}>{textoFiltro}</Text>
            </TouchableOpacity>

            {menuAberto && (
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  onPress={() => aplicarFiltro("baixo")}
                  style={styles.menuItem}
                >
                  <Text>{t("estoque.filtro_baixo")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => aplicarFiltro("sem")}
                  style={styles.menuItem}
                >
                  <Text>{t("estoque.filtro_sem")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => aplicarFiltro("em_estoque")}
                  style={styles.menuItem}
                >
                  <Text>{t("estoque.filtro_limpar")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.dropdownRow}>
            <View style={{ flex: 1 }}>
              <DropdownInterativo
                label={t("estoque.todos_setores")}
                options={[{ id: null, nome: t("estoque.todos_setores") }, ...setores]}
                onSelect={(item) => {
                  setSetorSelecionado(item);
                  setPaginaAtual(0);
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <DropdownInterativo
                label={categoriaSelecionada?.nome || t("estoque.todas_categorias")}
                options={[{ id: null, nome: t("estoque.todas_categorias") }, ...categorias]}
                onSelect={(item) => setCategoriaSelecionada(item)}
              />
            </View>
          </View>

          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardValue}>
                {valorEstoque.toLocaleString(i18n.language, {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
              <Text style={styles.cardLabel}>{t("estoque.valor_total")}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardValue}>
                {lucroBruto.toLocaleString(i18n.language, {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
              <Text style={styles.cardLabel}>{t("estoque.receita_estimada")}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardValue}>
                {lucroLiquido.toLocaleString(i18n.language, {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
              <Text style={styles.cardLabel}>{t("estoque.lucro_estimado")}</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: "#FFC107" }]} />
                <Text style={styles.statusNumber}>{estoqueBaixo || 0}</Text>
              </View>
              <Text style={styles.statusLabel}>{t("estoque.estoque_baixo")}</Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: "red" }]} />
                <Text style={styles.statusNumber}>{semEstoque || 0}</Text>
              </View>
              <Text style={styles.statusLabel}>{t("estoque.sem_estoque")}</Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: "green" }]} />
                <Text style={styles.statusNumber}>{quantidadeProdutosEmEstoque || 0}</Text>
              </View>
              <Text style={styles.statusLabel}>{t("estoque.em_estoque")}</Text>
            </View>
          </View>

          <Tabela
            data={produtos}
            onDelete={handleDeleteProduto}
            onEdit={handleEditarProduto}
          />

          <View style={styles.pagination}>
            <TouchableOpacity
              disabled={paginaAtual === 0}
              onPress={() => setPaginaAtual(paginaAtual - 1)}
            >
              <Ionicons
                name="chevron-back"
                size={25}
                color={paginaAtual === 0 ? "#aeaeae" : "#1E22AA"}
                style={{ marginRight: 2 }}
              />
            </TouchableOpacity>

            {Array.from({ length: totalPaginas }).map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setPaginaAtual(index)}
                style={[
                  styles.pageNumber,
                  paginaAtual === index && styles.pageActive,
                ]}
              >
                <Text
                  style={
                    paginaAtual === index
                      ? [styles.pageTextActive, { fontSize: 16 }]
                      : [styles.pageText, { fontSize: 16 }]
                  }
                >
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              disabled={paginaAtual === totalPaginas - 1}
              onPress={() => setPaginaAtual(paginaAtual + 1)}
            >
              <Ionicons
                name="chevron-forward"
                size={25}
                color={paginaAtual === totalPaginas - 1 ? "#aeaeae" : "#1E22AA"}
                style={{ marginRight: 2 }}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f2f2" },
  container: { padding: 16 },
  topBar: { flexDirection: "row", marginBottom: 10, zIndex: 999 },
  searchInput: { flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 8, marginRight: 8, width: "50%" },
  filterButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#e6e6e6", paddingHorizontal: 10, borderRadius: 8, width: "50%" },
  filterText: { marginLeft: 5 },
  dropdownMenu: { position: "absolute", top: 40, right: 0, backgroundColor: "#fff", borderRadius: 8, elevation: 10, zIndex: 9999, borderWidth: 1, borderColor: "#e6e6e6", minWidth: 150 },
  menuItem: { padding: 10 },
  dropdownRow: { flexDirection: "row", marginBottom: 10, gap: 8 },
  cardRow: { justifyContent: "space-between", marginVertical: 10, gap: 10 },
  card: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "100%", elevation: 3 },
  cardValue: { fontWeight: "bold", fontSize: 14, textAlign: "center" },
  cardLabel: { fontSize: 12, color: "#666", textAlign: "center" },
  statusRow: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", padding: 15, borderRadius: 12, marginVertical: 10 },
  statusItem: { alignItems: "center" },
  statusIndicator: { flexDirection: "row", alignItems: "center" },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  statusNumber: { fontWeight: "bold", fontSize: 16 },
  statusLabel: { fontSize: 12, color: "#666" },
  pagination: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginVertical: 15, gap: 6, paddingBottom: 10 },
  pageButton: { fontSize: 18, paddingHorizontal: 10 },
  pageNumber: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: "#e6e6e6" },
  pageActive: { backgroundColor: "#1E22AA" },
  pageText: { color: "#333" },
  pageTextActive: { color: "#fff", fontWeight: "bold" },
});