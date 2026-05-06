import 'text-encoding';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Client } from '@stomp/stompjs';
import api from "../../../provider/api";
import { recuperarToken } from "../../../utils/storage";
import { ENDPOINTS } from "../../../utils/endpoints";

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState('nao_lidas');
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (global.setHeaderTitulo) {
      global.setHeaderTitulo("Notificações");
      global.setHeaderSubTitulo("Visualize as notificações de seu negócio em tempo real!");
    }

    const inicializar = async () => {
      const tokenRecuperado = await recuperarToken();
      setToken(tokenRecuperado);
      if (tokenRecuperado) {
        carregarNotificacoesDoServidor(tokenRecuperado);
      } else {
        setCarregando(false);
        console.error("Token não encontrado!");
      }
    };

    inicializar();
  }, []);

  const carregarNotificacoesDoServidor = async (tokenAtual) => {
    try {
      setCarregando(true);
      const resposta = await api.get(`${ENDPOINTS.NOTIFICACOES}`, {
        headers: { Authorization: `Bearer ${tokenAtual}` }
      });
      setNotificacoes(resposta.data);
    } catch (error) {
      console.error("Erro ao procurar notificações no backend:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const baseUrl = api.baseURL || "http://localhost:8080/";
    const wsBaseUrl = baseUrl.replace(/^http/, 'ws').replace(/\/?$/, '');
    const socketUrl = `${wsBaseUrl}/ws`;

    const stompClient = new Client({
      brokerURL: socketUrl,
      forceWebsockets: true,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe('/topic/notificacoes', () => {
          if (token) {
            carregarNotificacoesDoServidor(token);
          }
        });
      },
    });

    stompClient.activate();
    return () => stompClient.deactivate();
  }, [token]);

  const marcarComoLido = async (id) => {
    try {
      await api.patch(`${ENDPOINTS.NOTIFICACOES}/${id}/lida`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotificacoes(prev =>
        prev.map(n => n.id === id ? { ...n, lida: true } : n)
      );

      global.atualizarContadorNotificacoes(-1);
    } catch (error) {
      console.error("Erro ao atualizar status de leitura:", error);
    }
  };

  const apagarNotificacao = async (id) => {
    try {
      await api.delete(`${ENDPOINTS.NOTIFICACOES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotificacoes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
    }
  };

  const notificacoesFiltradas = notificacoes.filter(
    (item) => abaAtiva === 'nao_lidas' ? !item.lida : item.lida
  );

  const getIconProps = (titulo, lida) => {
    const texto = titulo ? titulo.toUpperCase() : "";

    let iconName = "notifications-outline";
    let iconColor = "#1E22AA";

    // ESTOQUE
    if (texto.includes("PRODUTO") || texto.includes("ESTOQUE")) {

      if (texto.includes("CADASTRADO")) {
        iconName = "cube-outline"; // produto novo
        iconColor = "#1E22AA";
      }
      else if (texto.includes("BAIXO")) {
        iconName = "alert-circle-outline"; // atenção
        iconColor = "#F29C11";
      }
      else if (texto.includes("ALTO")) {
        iconName = "alert-circle-outline"; // atenção
        iconColor = "#F29C11";
      }
      else if (texto.includes("SEM")) {
        iconName = "alert-circle-outline";// crítico
        iconColor = "#dc3545";
      }
      else if (texto.includes("REMOVIDO")) {
        iconName = "trash-bin-outline"; // remoção
        iconColor = "#dc3545";
      }
      else {
        iconName = "archive-outline";
      }
    }

    // 💰 VENDA
    else if (texto.includes("VENDA")) {
      iconName = "cash-outline"; // dinheiro direto
      iconColor = "#28a745";
    }

    // 👤 FUNCIONÁRIO
    else if (
      texto.includes("COLABORADOR") ||
      texto.includes("FUNCIONÁRIO") ||
      texto.includes("FUNCIONARIO")
    ) {

      if (texto.includes("NOVO")) {
        iconName = "person-add-outline";
        iconColor = "#28a745";
      }
      else if (texto.includes("DESLIGAMENTO")) {
        iconName = "person-remove-outline";
        iconColor = "#6c757d";
      }
      else {
        iconName = "person-outline";
        iconColor = "#6f42c1";
      }
    }

    // fallback erro
    else if (texto.includes("ERRO") || texto.includes("FALHA")) {
      iconName = "alert-circle-outline";
      iconColor = "#dc3545";
    }

    // sucesso geral
    else if (texto.includes("SUCESSO")) {
      iconName = "checkmark-circle-outline";
      iconColor = "#28a745";
    }

    // se lida → cinza
    if (lida) {
      iconColor = "#999";
    }

    return { name: iconName, color: iconColor };
  };

  function renderItem({ item }) {
    const { name, color } = getIconProps(item.titulo, item.lida);

    return (
      <View style={[styles.card, item.lida && styles.cardLido]}>
        <View style={styles.iconContainer}>
          <Ionicons name={name} size={26} color={color} />
        </View>

        <View style={styles.content}>
          <Text style={[styles.titulo, item.lida && styles.textoLido]}>
            {item.titulo}
          </Text>
          <Text style={[styles.mensagem, item.lida && styles.textoLido]}>
            {item.mensagem}
          </Text>
          <Text style={styles.data}>
            {new Date(item.dataCriacao).toLocaleString("pt-BR")}
          </Text>
        </View>

        {abaAtiva === 'nao_lidas' ? (
          <TouchableOpacity style={styles.btnAcao} onPress={() => marcarComoLido(item.id)}>
            <Ionicons name="checkmark-circle-outline" size={26} color="#0F14B8" />
            <Text style={[styles.textAcao, { color: "#0F14B8" }]}>Lido</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnAcao} onPress={() => apagarNotificacao(item.id)}>
            <Ionicons name="trash-bin-outline" size={22} color="#dc3545" />
            <Text style={[styles.textAcao, { color: "#dc3545" }]}>Apagar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, abaAtiva === 'nao_lidas' && styles.tabButtonActive]}
          onPress={() => setAbaAtiva('nao_lidas')}
        >
          <Text style={[styles.tabText, abaAtiva === 'nao_lidas' && styles.tabTextActive]}>
            Novas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, abaAtiva === 'lidas' && styles.tabButtonActive]}
          onPress={() => setAbaAtiva('lidas')}
        >
          <Text style={[styles.tabText, abaAtiva === 'lidas' && styles.tabTextActive]}>
            Lidas
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="large" color="#1E22AA" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={notificacoesFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {abaAtiva === 'nao_lidas'
                ? "Tudo em dia por aqui!"
                : "Nenhuma notificação arquivada."}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabButton: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabButtonActive: { borderBottomWidth: 2, borderBottomColor: '#1E22AA' },
  tabText: { fontSize: 14, color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#1E22AA' },
  card: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center"
  },
  cardLido: { backgroundColor: '#f1f1f1' },
  iconContainer: { marginRight: 10, width: 35, alignItems: 'center' },
  content: { flex: 1 },
  titulo: { fontSize: 14, fontWeight: "600", color: "#111" },
  mensagem: { fontSize: 13, color: "#555", marginTop: 2 },
  textoLido: { color: "#888" },
  data: { fontSize: 11, color: "#999", marginTop: 6 },
  btnAcao: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#eaeaea',
    minWidth: 60
  },
  textAcao: { fontSize: 10, fontWeight: "600", marginTop: 2 },
  empty: { textAlign: "center", color: "#999", marginTop: 50, fontSize: 15 },
});