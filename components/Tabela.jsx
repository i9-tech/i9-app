import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function Tabela({ data }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={{ flexDirection: "row" }}>
          
          {/* COLUNA FIXA */}
          <View style={styles.fixedColumn}>
            
            {/* HEADER FIXO */}
            <Text style={styles.fixedHeader}>Nome</Text>
            
            {/* LINHAS FIXAS */}
            {data.map((item, index) => (
              <Text
                key={index}
                style={styles.fixedCell}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.nome}
              </Text>
            ))}
          </View>

          {/* SCROLL HORIZONTAL  */}
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              
              {/* HEADER SCROLL */}
              <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Cód.</Text>
                <Text style={styles.headerText}>Compra</Text>
                <Text style={styles.headerText}>Venda</Text>
                <Text style={styles.headerText}>Estoque</Text>
                <Text style={styles.headerText}>Registro</Text>
                <Text style={styles.headerText}>Descrição</Text>
                <Text style={styles.headerText}>Ação</Text>
              </View>

              {/* LINHAS SCROLL */}
              {data.map((item, index) => (
                <View key={index} style={styles.rowContainer}>
                  
                  <Text style={styles.cell}>
                    {item.id}
                  </Text>

                  <Text style={styles.cell}>
                    R$ {item.compra.toFixed(2)}
                  </Text>

                  <Text style={styles.cell}>
                    R$ {item.venda.toFixed(2)}
                  </Text>

                  <Text style={styles.cell}>
                    {item.estoque ?? "-"}
                  </Text>

                  <Text style={styles.cell}>
                    {item.registro ?? "-"}
                  </Text>

                  <Text
                    style={styles.cell}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.descricao ?? "-"}
                  </Text>

                  <View style={[styles.cell, { flexDirection: "row", alignItems: "center" }]}>
                    <Text style={styles.action}>✏️</Text>
                    <Text style={[styles.action, { marginLeft: 12 }]}>🗑️</Text>
                  </View>
                </View>
              ))}

            </View>
          </ScrollView>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
  },
  fixedColumn: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedHeader: {
    width: 160,
    paddingVertical: 14,
    paddingHorizontal: 10,
    backgroundColor: "#2C2FA3",
    color: "#fff",
    fontWeight: "bold",
  },
  fixedCell: {
    width: 160,
    paddingVertical: 18,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerContainer: {
    flexDirection: "row",
    backgroundColor: "#2C2FA3",
  },
  headerText: {
    width: 120,
    paddingVertical: 14,
    paddingHorizontal: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  cell: {
    width: 120,
    paddingVertical: 18,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#333",
  },
  action: {
    color: "#2C2FA3",
    fontWeight: "bold",
  },
});