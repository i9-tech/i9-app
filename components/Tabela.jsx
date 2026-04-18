import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable, Alert } from "react-native";
import ConfirmModal from "../components/ConfirmModal";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Tabela({ data, onDelete, onEdit }) {
  // Se não houver dados, não renderiza a estrutura para evitar bugs visuais
  if (!data || data.length === 0) return null;

  const [modalVisible, setModalVisible] = useState(false);
  const [itemSelecionado, setItemSelecionado] = useState(null);


  const nomeSelecionado = itemSelecionado?.nome || "";

  const abrirConfirmacao = (item) => {
    setItemSelecionado(item);
    setModalVisible(true);
  };

  const confirmarDelete = () => {
    if (!itemSelecionado) return;

    const id = itemSelecionado.id;
    const nome = itemSelecionado.nome;

    setModalVisible(false);
    setItemSelecionado(null);

    onDelete(id, nome);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={{ flexDirection: "row" }}>

          {/* COLUNA FIXA (NOME) */}
          <View style={styles.fixedColumn}>
            <Text style={styles.fixedHeader}>Nome</Text>
            {data.map((item, index) => (
              <View key={item.id} style={styles.fixedRowContainer}>
                <Text style={styles.fixedCell} numberOfLines={1} ellipsizeMode="tail">
                  {item.nome}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View style={{ flex: 1 }}>
              {/* HEADER DA TABELA */}
              <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { width: 70 }]}>Cód.</Text>
                <Text style={[styles.headerText, { width: 110 }]}>Compra</Text>
                <Text style={[styles.headerText, { width: 110 }]}>Venda</Text>
                <Text style={[styles.headerText, { width: 80, textAlign: 'center' }]}>Estoque</Text>
                <Text style={[styles.headerText, { width: 110 }]}>Mín/Máx</Text>
                <Text style={[styles.headerText, { width: 110 }]}>Registro</Text>
                {/* A Descrição usa flex: 1 para "sugar" todo o espaço branco restante */}
                <Text style={[styles.headerText, { flex: 1, minWidth: 200 }]}>Descrição</Text>
                <Text style={[styles.headerText, { width: 90, textAlign: 'center' }]}>Ação</Text>
              </View>

              {/* LINHAS DA TABELA */}
              {data.map((item, index) => (
                <View key={item.id} style={styles.rowContainer}>
                  <Text style={[styles.cell, { width: 70 }]}>{item.codigo ?? "-"}</Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    R$ {item.valorCompra?.toFixed(2) ?? "0.00"}
                  </Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    R$ {item.valorUnitario?.toFixed(2) ?? "0.00"}
                  </Text>

                  <Text style={[
                    styles.cell,
                    {
                      width: 80,
                      textAlign: 'center',
                      color: item.quantidade <= (item.quantidadeMin || 0) ? "#FFA000" : "#333",
                      fontWeight: item.quantidade === 0 ? "bold" : "normal"
                    }
                  ]}>
                    {item.quantidade ?? "0"}
                  </Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    {item.quantidadeMin ?? 0} / {item.quantidadeMax ?? 0}
                  </Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    {item.dataRegistro ? new Date(item.dataRegistro).toLocaleDateString("pt-BR") : "-"}
                  </Text>

                  <Text
                    style={[styles.cell, { flex: 1, minWidth: 200 }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.descricao ?? "-"}
                  </Text>

                  <View style={[styles.cell, { width: 90, flexDirection: 'row', justifyContent: 'center' }]}>
                    <Pressable onPress={() => onEdit(item)}>
                      <Text style={{ fontSize: 16 }}>✏️</Text>
                    </Pressable>
                    <Pressable onPress={() => abrirConfirmacao(item)}>
                      <Text style={{ fontSize: 16, marginLeft: 10 }}>🗑️</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <ConfirmModal
        visible={modalVisible}
        title="Excluir produto"
        message={`Deseja excluir "${nomeSelecionado}"?`}
        confirmText={"Excluir"}
        onConfirm={confirmarDelete}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    marginBottom: 20,
    width: '100%',
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  fixedColumn: {
    backgroundColor: "#fff",
    zIndex: 10,
    borderRightWidth: 1,
    borderRightColor: "#eee",
  },
  fixedHeader: {
    width: 150,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#2C2FA3",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  fixedRowContainer: {
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    height: 52,
    justifyContent: 'center',
  },
  fixedCell: {
    width: 150,
    paddingHorizontal: 12,
    fontSize: 13,
    color: "#333",
  },
  headerContainer: {
    flexDirection: "row",
    backgroundColor: "#2C2FA3",
    height: 45,
    alignItems: 'center',
  },
  headerText: {
    paddingHorizontal: 10,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  rowContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    height: 52,
    alignItems: 'center',
  },
  cell: {
    paddingHorizontal: 10,
    fontSize: 13,
    color: "#333",
  },
});