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

const setores = [
  { id: "01", nome: "Restaurante" },
  { id: "02", nome: "Pastelaria" },
];

const categorias = [
  { id: "01", nome: "Doce" },
  { id: "02", nome: "Salgado" },
];

export default function Estoque() {
  const [setorSelecionado, setSetorSelecionado] = useState("Todos Setores");
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Todas Categorias");
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [ordem] = useState("asc");
  const [termoBusca, setTermoBusca] = useState("");
  const [produtos, setProdutos] = useState([]);
  const [itensPorPagina, setItensPorPagina] = useState(3);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const inicio = paginaAtual * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const aplicarFiltro = (status) => {
    setFiltroStatus(status);
    setMenuAberto(false);
    setPaginaAtual(0);
  };

  const textoFiltro =
    filtroStatus === "baixo" ? (
      "⚠️ Estoque Baixo"
    ) : filtroStatus === "sem" ? (
      "❌ Sem Estoque"
    ) : (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name="search" size={18} color="#333" />
        <Text style={{ marginLeft: 5 }}>Filtros</Text>
      </View>
    );

  useEffect(() => {
    buscarUsuario().then((dados) => setUsuario(dados));
    recuperarToken().then((t) => setToken(t));
  }, []);

  useEffect(() => {
    // console.log(usuario);
    // console.log(token);
    // Aguarda usuario e token estarem prontos
    if (!usuario || !token) return;

    const termoSemAcento = (termoBusca || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    api
      .get(`${ENDPOINTS.PRODUTOS_PAGINADO}/${usuario.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          paginaAtual,
          itensPorPagina,
          ordem,
          termoBusca: termoSemAcento,
          statusEstoque: filtroStatus,
          // setorId: setorSelecionado ? Number(setorSelecionado) : undefined,
          // categoriaId: categoriaSelecionada
          //   ? Number(categoriaSelecionada)
          //   : undefined,
        },
      })
      .then((res) => {
        setProdutos(res.data.content);
        // console.log(res.data);
        // console.log(res.data.content);
      })
      .catch((err) => {
        console.error("Erro ao buscar produtos:", err);
      });
  }, [
    usuario,
    token,
    paginaAtual,
    termoBusca,
    filtroStatus,
    setorSelecionado,
    categoriaSelecionada,
  ]);

  const produtosFiltrados = produtos.filter((produto) => {
    if (filtroStatus === "baixo")
      return produto.estoque > 0 && produto.estoque <= 2;
    if (filtroStatus === "sem") return produto.estoque === 0;
    return true;
  });
  const totalPaginas = Math.ceil(produtosFiltrados.length / itensPorPagina);
  const produtosPaginados = produtosFiltrados.slice(inicio, fim);

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Barra superior */}
          <View style={styles.topBar}>
            <TextInput
              placeholder="Procurar Produto"
              style={styles.searchInput}
              value={termoBusca}
              onChangeText={setTermoBusca}
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
                  <Text>⚠️ Estoque Baixo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => aplicarFiltro("sem")}
                  style={styles.menuItem}
                >
                  <Text>❌ Sem Estoque</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => aplicarFiltro(null)}
                  style={styles.menuItem}
                >
                  <Text>🔄 Limpar Filtro</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Dropdowns */}
          <View style={styles.dropdownRow}>
            <DropdownInterativo
              label={setorSelecionado}
              options={["Todos Setores", ...setores.map((s) => s.nome)]}
            />

            <DropdownInterativo
              label={categoriaSelecionada}
              options={["Todas Categorias", ...categorias.map((c) => c.nome)]}
            />
          </View>

          {/* Cards */}
          <View style={styles.cardRow}>
            <View style={styles.card}>
              <Text style={styles.cardValue}>R$24.750,00</Text>
              <Text style={styles.cardLabel}>Valor Total do Estoque</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardValue}>R$40.322,00</Text>
              <Text style={styles.cardLabel}>Receita Estimada</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardValue}>R$15.572,00</Text>
              <Text style={styles.cardLabel}>Lucro Estimado de Venda</Text>
            </View>
          </View>

          {/* Indicadores */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: "#FFC107" }]} />
                <Text style={styles.statusNumber}>2</Text>
              </View>
              <Text style={styles.statusLabel}>Estoque Baixo</Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: "red" }]} />
                <Text style={styles.statusNumber}>0</Text>
              </View>
              <Text style={styles.statusLabel}>Sem Estoque</Text>
            </View>

            <View style={styles.statusItem}>
              <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: "green" }]} />
                <Text style={styles.statusNumber}>4022</Text>
              </View>
              <Text style={styles.statusLabel}>Em Estoque</Text>
            </View>
          </View>

          {/* Tabela */}
          <Tabela
            columns={[
              "Cód.",
              "Nome",
              "Compra",
              "Venda",
              "Estoque",
              "Registro",
              "Descrição",
              "Ação",
            ]}
            data={produtos}
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

        {/* Botão adicionar fixo */}
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },

  container: {
    padding: 16,
  },

  topBar: {
    flexDirection: "row",
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6e6e6",
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  filterText: {
    marginLeft: 5,
  },

  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 4,
    zIndex: 10,
  },

  menuItem: {
    padding: 10,
  },

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  addButton: {
    position: "absolute",
    bottom: -23,
    alignSelf: "center",
    backgroundColor: "#1E22AA",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 28,
    marginTop: -2,
  },

  cardRow: {
    justifyContent: "space-between",
    marginVertical: 10,
    gap: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    elevation: 3,
  },

  cardValue: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },

  cardLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
  },

  statusItem: {
    alignItems: "center",
  },

  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },

  statusNumber: {
    fontWeight: "bold",
    fontSize: 16,
  },

  statusLabel: {
    fontSize: 12,
    color: "#666",
  },

  pagination: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 15,
    gap: 6,
    paddingBottom: 10,
  },

  pageButton: {
    fontSize: 18,
    paddingHorizontal: 10,
  },

  pageNumber: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: "#e6e6e6",
  },

  pageActive: {
    backgroundColor: "#1E22AA",
  },

  pageText: {
    color: "#333",
  },

  pageTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
});
