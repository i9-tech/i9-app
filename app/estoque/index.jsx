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
import Tabela from "../../components/Tabela";
import DropdownInterativo from "../../components/Dropdown";
import { useEffect, useState } from "react";
import { api } from "../../service/api";
import { ENDPOINTS } from "../../utils/endpoint";
import { ROUTERS } from "../../utils/routers";

const setores = [
  { id: "01", nome: "Restaurante" },
  { id: "02", nome: "Pastelaria" },
];

const categorias = [
  { id: "01", nome: "Doce" },
  { id: "02", nome: "Salgado" },
];

export default function Estoque() {

  // const token = localStorage.getItem("token");
  // const funcionario = getFuncionario();

  const token = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIxMjMuNDU2Ljc4OS0wMCIsImF1dGhvcml0aWVzIjoiUk9MRV9DT1pJTkhBLFJPTEVfRVNUT1FVRSxST0xFX0FURU5ESU1FTlRPLFJPTEVfUFJPUFJJRVRBUklPLFBST1BSSUVUQVJJT19ST0xFX1BMQU5PX0FDRVNTT19EQVNIQk9BUkQiLCJhY2Vzc29TZXRvckNvemluaGEiOnRydWUsImFjZXNzb1NldG9yRXN0b3F1ZSI6dHJ1ZSwiYWNlc3NvU2V0b3JBdGVuZGltZW50byI6dHJ1ZSwicHJvcHJpZXRhcmlvIjp0cnVlLCJhY2Vzc29EYXNoYm9hcmQiOnRydWUsImlhdCI6MTc3MzEwODQxNCwiZXhwIjoxNzc2NzA4NDE0fQ.tqBvm24RNv9dL7zYUaq4mqZ6E-rp39kPgkn24BkxreNbzFysIzSiHBTk-qawWjibvCZR5eMc775KCFcBxpEjkA';
  const funcionario = {
    userId: 1
  }

  const [produtos, setProdutos] = useState([]);

  const [pagina, setPagina] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const quantidadePorPagina = 10;

  const [setorSelecionado, setSetorSelecionado] = useState("Todos Setores");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas Categorias");
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState(null);

  const aplicarFiltro = (status) => {
    setFiltroStatus(status);
    setPagina(0);
    setMenuAberto(false);
  };
  useEffect(() => {
    buscarProdutos();
  }, [pagina]);


  const produtosFiltrados = produtos.filter((produto) => {
    if (filtroStatus === "baixo") {
      return (
        (produto.quantidadeMin !== undefined && produto.quantidade < produto.quantidadeMin)
      );
    }
    if (filtroStatus === "sem") return produto.quantidade === 0;
    return true;
  });

  const textoFiltro =
    filtroStatus === "baixo"
      ? "⚠️ Estoque Baixo"
      : filtroStatus === "sem"
        ? "❌ Sem Estoque"
        : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="search" size={18} color="#333" />
            <Text style={{ marginLeft: 5 }}>Filtros</Text>
          </View>
        );

  const buscarProdutos = () => {
    api.get(`${ENDPOINTS.PRODUTOS_PAGINADO}/${funcionario.userId}`, {
      params: {
        pagina: pagina,
        quantidadePorPagina: quantidadePorPagina,
      },
      headers: {
        Authorization: `Bearer ${token}`
      },
    })

      .then((response) => {
        setProdutos(response.data.content);
        setTotalPaginas(response.data.totalPages);
      })

      .catch((error) => {
        console.log("Erro ao buscar produtos:", error);
      });

  };

  const proximaPagina = () => {
    if (pagina < totalPaginas - 1) {
      setPagina(pagina + 1);
    }
  };

  const paginaAnterior = () => {
    if (pagina > 0) {
      setPagina(pagina - 1);
    }
  };


  const produtosFormatados = produtosFiltrados.map((p) => ({
    id: p.id,
    nome: p.nome,
    compra: p.valorCompra,
    venda: p.valorUnitario,
    estoque: p.quantidade,
    registro: p.dataRegistro,
    descricao: p.descricao,
  }));

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.topBar}>
          <TextInput
            placeholder="Procurar Produtos"
            style={styles.searchInput}
          />

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setMenuAberto(!menuAberto)}
          >
            <Text style={styles.filterText}>{textoFiltro}</Text>
          </TouchableOpacity>

          {menuAberto && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity onPress={() => aplicarFiltro("baixo")} style={styles.menuItem}>
                <Text>⚠️ Estoque Baixo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => aplicarFiltro("sem")} style={styles.menuItem}>
                <Text>❌ Sem Estoque</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => aplicarFiltro(null)} style={styles.menuItem}>
                <Text>🔄 Limpar Filtro</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.dropdownRow}>
          <DropdownInterativo
            label={setorSelecionado}
            options={["Todos Setores", ...setores.map((s) => s.nome)]}
            onSelect={setSetorSelecionado}
          />

          <DropdownInterativo
            label={categoriaSelecionada}
            options={["Todas Categorias", ...categorias.map((c) => c.nome)]}
            onSelect={setCategoriaSelecionada}
          />
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
        </TouchableOpacity>

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

        <Tabela
          columns={["Cód.", "Nome", "Compra", "Venda", "Estoque", "Registro", "Descrição", "Ação"]}
          data={produtosFormatados}
        />
        <View style={styles.paginacao}>
          <TouchableOpacity
            style={styles.botaoPagina}
            onPress={paginaAnterior}
            disabled={pagina === 0}
          >
            <Text style={styles.textoPaginacao}>Anterior</Text>
          </TouchableOpacity>

          <Text style={styles.textoPagina}>
            Página {pagina + 1} de {totalPaginas}
          </Text>

          <TouchableOpacity
            style={styles.botaoPagina}
            onPress={proximaPagina}
            disabled={pagina >= totalPaginas - 1}
          >
            <Text style={styles.textoPaginacao}>Próxima</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    backgroundColor: "#1E22AA",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },

  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "32%",
    elevation: 3,
  },

  cardValue: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },

  cardLabel: {
    fontSize: 10,
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

  paginacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  botaoPagina: {
    backgroundColor: "#1E22AA",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },

  textoPaginacao: {
    color: "#fff",
  },
  textoPagina: {
    fontWeight: "bold",

  },
});