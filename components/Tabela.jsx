import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions, Pressable } from "react-native";
import ConfirmModal from "./ConfirmModal";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Tabela({ data, onDelete, onEdit }) {
  const { t, i18n } = useTranslation();
  
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
            <Text style={styles.fixedHeader}>{t("componentes.tabela.col_nome")}</Text>
            {data.map((item) => (
              <View key={item.id} style={styles.fixedRowContainer}>
                <Text style={styles.fixedCell} numberOfLines={1} ellipsizeMode="tail">
                  {item.nome}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1 }}>
              {/* HEADER DA TABELA */}
              <View style={styles.headerContainer}>
                <Text style={[styles.headerText, { width: 70 }]}>{t("componentes.tabela.col_cod")}</Text>
                <Text style={[styles.headerText, { width: 110 }]}>{t("componentes.tabela.col_compra")}</Text>
                <Text style={[styles.headerText, { width: 110 }]}>{t("componentes.tabela.col_venda")}</Text>
                <Text style={[styles.headerText, { width: 80, textAlign: 'center' }]}>{t("componentes.tabela.col_estoque")}</Text>
                <Text style={[styles.headerText, { width: 110 }]}>{t("componentes.tabela.col_min_max")}</Text>
                <Text style={[styles.headerText, { width: 110 }]}>{t("componentes.tabela.col_registro")}</Text>
                <Text style={[styles.headerText, { flex: 1, minWidth: 200 }]}>{t("componentes.tabela.col_descricao")}</Text>
                <Text style={[styles.headerText, { width: 90, textAlign: 'center' }]}>{t("componentes.tabela.col_acao")}</Text>
              </View>

              {/* LINHAS DA TABELA */}
              {data.map((item) => (
                <View key={item.id} style={styles.rowContainer}>
                  <Text style={[styles.cell, { width: 70 }]}>{item.codigo ?? "-"}</Text>
                  
                  <Text style={[styles.cell, { width: 110 }]}>
                    {(item.valorCompra || 0).toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' })}
                  </Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    {(item.valorUnitario || 0).toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' })}
                  </Text>

                  <Text style={[styles.cell, { width: 80, textAlign: 'center', color: item.quantidade <= (item.quantidadeMin || 0) ? "#FFA000" : "#333", fontWeight: item.quantidade === 0 ? "bold" : "normal" }]}>
                    {item.quantidade ?? "0"}
                  </Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    {item.quantidadeMin ?? 0} / {item.quantidadeMax ?? 0}
                  </Text>

                  <Text style={[styles.cell, { width: 110 }]}>
                    {item.dataRegistro ? new Date(item.dataRegistro).toLocaleDateString(i18n.language) : "-"}
                  </Text>

                  <Text style={[styles.cell, { flex: 1, minWidth: 200 }]} numberOfLines={1} ellipsizeMode="tail">
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
        title={t("componentes.tabela.modal_excluir_titulo")}
        message={t("componentes.tabela.modal_excluir_msg", { nome: nomeSelecionado })}
        confirmText={t("componentes.tabela.modal_excluir_confirmar")}
        onConfirm={confirmarDelete}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 12, marginBottom: 20, width: '100%' },
  card: { borderRadius: 12, overflow: "hidden", backgroundColor: "#fff", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, width: '100%' },
  fixedColumn: { backgroundColor: "#fff", zIndex: 10, borderRightWidth: 1, borderRightColor: "#eee" },
  fixedHeader: { width: 150, paddingVertical: 14, paddingHorizontal: 12, backgroundColor: "#2C2FA3", color: "#fff", fontWeight: "bold", fontSize: 13 },
  fixedRowContainer: { borderBottomWidth: 1, borderBottomColor: "#eeeeee", height: 52, justifyContent: 'center' },
  fixedCell: { width: 150, paddingHorizontal: 12, fontSize: 13, color: "#333" },
  headerContainer: { flexDirection: "row", backgroundColor: "#2C2FA3", height: 45, alignItems: 'center' },
  headerText: { paddingHorizontal: 10, color: "#fff", fontWeight: "bold", fontSize: 13 },
  rowContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee", height: 52, alignItems: 'center' },
  cell: { paddingHorizontal: 10, fontSize: 13, color: "#333" }
});