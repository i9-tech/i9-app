import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Tabela from "../components/Tabela";
import DropdownInterativo from "../components/Dropdown";
import { useState } from "react";

const setores = [
  { id: "01", nome: "Restaurante" },
  { id: "02", nome: "Pastelaria" },
];

const categorias = [
  { id: "01", nome: "Doce" },
  { id: "02", nome: "Salgado" },
];

const produtos = [
  { id: "1013", nome: "Barrmmja de chocolaaate", compra: 2, venda: 12, estoque: 50, registro: "01/03/2026", descricao: "Chocolate ao leite 90g" },
  { id: "1026", nome: "Batata Fritop", compra: 2, venda: 6, estoque: 15, registro: "28/02/2026", descricao: "Salgadinho sabor churrasco" },
  { id: "1023", nome: "Bis", compra: 2, venda: 10.9, estoque: 0, registro: "25/02/2026", descricao: "Chocolate wafer" },
  { id: "1030", nome: "Biscoito de polvilho", compra: 2, venda: 5, estoque: 5, registro: "20/02/2026", descricao: "Pacote 100g" },
  { id: "1031", nome: "Biscoito de polvilho", compra: 2, venda: 5, estoque: 5, registro: "20/02/2026", descricao: "Pacote 100g" },
];

export default function Estoque() {
  const [setorSelecionado, setSetorSelecionado] = useState("Todos Setores");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas Categorias");
  const [menuAberto, setMenuAberto] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState(null);

  const aplicarFiltro = (status) => {
    setFiltroStatus(status);
    setMenuAberto(false);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    if (filtroStatus === "baixo") return produto.estoque > 0 && produto.estoque <= 5;
    if (filtroStatus === "sem") return produto.estoque === 0;
    return true;
  });

  const textoFiltro = filtroStatus === "baixo" ? "⚠️ Estoque Baixo"
    : filtroStatus === "sem" ? "❌ Sem Estoque"
      : (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="search" size={18} color="#333" />
          <Text style={{ marginLeft: 5 }}>Filtros</Text>
        </View>
      );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />


      <FlatList
      
        data={[]}
        ListHeaderComponent={
          
          <View style={styles.container}>
            {/* 🔍 Barra superior */}
            <View style={styles.topBar}>
              <TextInput
                placeholder="Procurar Produto"
                style={styles.searchInput}
              />

              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setMenuAberto(!menuAberto)}
              >
                <Text style={styles.filterText}>{textoFiltro}</Text>
              </TouchableOpacity>

              {/* Menu Dropdown */}
              {menuAberto && (
                <View style={{ position: "absolute", top: 40, right: 0, backgroundColor: "#fff", borderRadius: 8, elevation: 4, zIndex: 10 }}>
                  <TouchableOpacity onPress={() => aplicarFiltro("baixo")} style={{ padding: 10 }}>
                    <Text>⚠️ Estoque Baixo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => aplicarFiltro("sem")} style={{ padding: 10 }}>
                    <Text>❌ Sem Estoque</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => aplicarFiltro(null)} style={{ padding: 10 }}>
                    <Text>🔄 Limpar Filtro</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Dropdowns */}
            <View style={styles.dropdownRow}>
              <DropdownInterativo
                label={setorSelecionado}
                options={["Todos Setores", ...setores.map(setor => setor.nome)]}
              />

              <DropdownInterativo
                label={categoriaSelecionada}
                options={["Todas Categorias", ...categorias.map(categoria => categoria.nome)]}
              />

            </View>

            {/* Botão adicionar */}
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>
                + Adicionar Produto
              </Text>
            </TouchableOpacity>

            {/* Cards resumo */}
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardValue}>R$24.750,00</Text>
                <Text style={styles.cardLabel}>
                  Valor Total do Estoque
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardValue}>R$40.322,00</Text>
                <Text style={styles.cardLabel}>
                  Receita Estimada
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardValue}>R$15.572,00</Text>
                <Text style={styles.cardLabel}>
                  Lucro Estimado de Venda
                </Text>
              </View>
            </View>

            {/* Indicadores */}
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={[styles.dot, { backgroundColor: "#FFC107", marginRight: 6 }]} />
                  <Text style={styles.statusNumber}>2</Text>
                </View>
                <Text style={styles.statusLabel}>Estoque Baixo</Text>
              </View>


              <View style={styles.statusItem}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={[styles.dot, { backgroundColor: "red", marginRight: 6 }]} />
                  <Text style={styles.statusNumber}>0</Text>
                </View>
                <Text style={styles.statusLabel}>Sem Estoque</Text>
              </View>

              <View style={styles.statusItem}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={[styles.dot, { backgroundColor: "green", marginRight: 6 }]} />
                  <Text style={styles.statusNumber}>4022</Text>
                </View>
                <Text style={styles.statusLabel}>Em Estoque</Text>
              </View>
            </View>

            {/* Tabela */}
            <Tabela
              columns={["Cód.", "Nome", "Compra", "Venda", "Estoque", "Registro", "Descrição", "Ação"]}
              data={produtos}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
   header: { padding: 16, backgroundColor: "#1E22AA", alignItems: "center", justifyContent: "center" },
  headerText: { color: "#fff", fontSize: 20, fontWeight: "bold" },

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

  dropdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  dropdown: {
    backgroundColor: "#e6e6e6",
    padding: 10,
    borderRadius: 8,
    width: "48%",
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
    textAlign: "center"
  },

  cardLabel: {
    fontSize: 10,
    color: "#666",
    textAlign: "center"
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

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  statusNumber: {
    fontWeight: "bold",
    fontSize: 16,
  },

  statusLabel: {
    fontSize: 12,
    color: "#666",
  },
});