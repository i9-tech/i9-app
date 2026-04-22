import { View, Text, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

export default function Notificacoes() {
  useEffect(() => {
    global.setHeaderTitulo("Notificações");
    global.setHeaderSubTitulo("Visualize as notificações de seu negócio!");
  }, []);

  const [notificacoes, setNotificacoes] = useState([]);

  useEffect(() => {
    // MOCK DE NOTIFICAÇÕES
    setNotificacoes([
      {
        id: 1,
        titulo: "📊 Relatório de Vendas",
        mensagem:
          "Lucro líquido de hoje: R$ 1.250,00. Maior venda no setor Bebidas.",
        data: new Date(),
      },
      {
        id: 2,
        titulo: "⚠️ Estoque Baixo",
        mensagem:
          "Produto 'Coca-Cola 350ml' está abaixo do estoque mínimo (5 unidades restantes).",
        data: new Date(),
      },
      {
        id: 3,
        titulo: "📦 Categoria Destaque",
        mensagem:
          "Categoria 'Hambúrgueres' teve aumento de 32% nas vendas hoje.",
        data: new Date(),
      },
      {
        id: 4,
        titulo: "🏪 Setor com maior lucro",
        mensagem:
          "O setor 'Lanchonete' foi o mais lucrativo do dia com R$ 3.420,00.",
        data: new Date(),
      },
      {
        id: 5,
        titulo: "🤖 Sistema",
        mensagem:
          "Backup automático realizado com sucesso às 03:00.",
        data: new Date(),
      },
    ]);
  }, []);

  function renderItem({ item }) {
    return (
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications-outline" size={22} color="#1E22AA" />
        </View>

        <View style={styles.content}>
          <Text style={styles.titulo}>{item.titulo}</Text>
          <Text style={styles.mensagem}>{item.mensagem}</Text>

          {item.data && (
            <Text style={styles.data}>
              {new Date(item.data).toLocaleString("pt-BR")}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notificacoes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma notificação encontrada</Text>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e6e6e6",
    backgroundColor: "#fff",
  },

  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  iconContainer: {
    marginRight: 10,
    justifyContent: "center",
  },

  content: {
    flex: 1,
  },

  titulo: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },

  mensagem: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  data: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
  },

  empty: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
  },
});