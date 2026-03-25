import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  buscarUsuario,
  recuperarToken,
  removerUsuario,
} from "../../../utils/storage";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { ENDPOINTS } from "../../../utils/endpoints";
import api from "../../../provider/api";
import Modal from "../../../components/Modal";
import { TextInput } from "react-native-web";
import { formatarData, formatarTelefone } from "../../../utils/auxiliar";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [plano, setPlano] = useState(null);
  const [token, setToken] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const router = useRouter();

  // Remova os dois useEffects antigos de carregar e fazer o GET, e use este:
  useEffect(() => {
    async function carregarDados() {
      try {
        const usuarioSalvo = await buscarUsuario();
        const tokenSalvo = await recuperarToken();
        
        setUsuario(usuarioSalvo);
        setToken(tokenSalvo);

        // Só faz a chamada na API se tiver o token!
        if (tokenSalvo) {
          const response = await api.get(
            `${ENDPOINTS.EMPRESAS}/${usuarioSalvo?.empresaId || 1}`, 
            { headers: { Authorization: `Bearer ${tokenSalvo}` } }
          );
          setEmpresa(response.data);
          setPlano(response.data.gerenciamentoPlano);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do perfil:", error);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    global.setHeaderTitulo("Meu Perfil");
    global.setHeaderSubTitulo("Visualize as informações de sua conta");
  }, []);

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.scrollContent}
    >
      <View>
        {modalVisivel && (
          <Modal titulo="Editar Senha" onClose={() => setModalVisivel(false)}>
            <View>
              <Text>Senha atual:</Text>
              <TextInput
                placeholder="Digite sua senha"
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 10,
                }}
              />
            </View>
            <View>
              <Text>Nova senha:</Text>
              <TextInput
                placeholder="Digite sua nova senha"
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 10,
                }}
              />
            </View>
            <View>
              <Text>Confirmar nova senha::</Text>
              <TextInput
                placeholder="Confirme sua nova senha"
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 10,
                }}
              />
            </View>

            <View style={{ marginTop: 45, gap: 15, justifyContent: "space-between" }}>
              <Pressable
                style={{
                  backgroundColor: "#0F14B8",
                  padding: 12,
                  borderRadius: 6,
                  alignItems: "center",
                }}
                onPress={() => Alert.alert("Função em desenvolvimento!")}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Salvar Alterações
                </Text>
              </Pressable>
              <Pressable
                style={{
                  backgroundColor: "#cacaca",
                  padding: 12,
                  borderRadius: 6,
                  alignItems: "center",
                }}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={{ color: "#000", fontWeight: "bold" }}>
                  Cancelar
                </Text>
              </Pressable>
            </View>
          </Modal>
        )}
      </View>

      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={50} color="#666" />
          </View>
        </View>
        <Text style={styles.nomeUsuario}>
          {usuario?.nome ?? "Carregando..."}
        </Text>
        <Text style={styles.nomeEmpresa}>
          {empresa?.nome ?? "Carregando..."}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <View style={[styles.card, styles.cardCol]}>
          <View style={styles.cardRow}>
            <Text style={styles.label}>📅 Conta criada em:</Text>
            <Text style={styles.value}>
              {formatarData(plano?.dataAdesao) ?? "Carregando..."}
            </Text>
          </View>
          <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>💼 Plano:</Text>
            <Text style={styles.value}>
              {empresa?.nomePlano ?? "Carregando..."}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{empresa?.email ?? "Carregando..."}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Telefone:</Text>
          <Text style={styles.value}>
            {formatarTelefone(empresa?.whatsapp) ?? "Carregando..."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Estabelecimento:</Text>
          <Text style={styles.value}>
            {empresa?.endereco ?? "Carregando..."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>CNPJ:</Text>
          <Text style={styles.value}>{empresa?.cnpj ?? "Carregando..."}</Text>
        </View>
      </View>

      <View style={styles.configSection}>
        <Text style={styles.configTitle}>Configurações</Text>

        <View style={styles.configBlock}>
          <Pressable
            style={styles.configItem}
            onPress={() => setModalVisivel(true)}
          >
            <Text style={styles.configText}>🔒 Alterar senha</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </Pressable>
          <Pressable
            style={[styles.configItem, { borderBottomWidth: 0 }]}
            onPress={() => Alert.alert("Função em desenvolvimento!")}
          >
            <Text style={styles.configText}>📦 Visualizar plano</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.botao}
          onPress={() => removerUsuario().then(() => router.push("/"))}
        >
          <Text style={styles.textoBotao}>Sair da Conta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  nomeUsuario: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },
  nomeEmpresa: {
    fontSize: 15,
    color: "#555",
    marginTop: 2,
  },

  infoSection: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FAFAFA",
    padding: 15,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardCol: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingVertical: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  value: {
    fontSize: 14,
    color: "#333",
  },

  configSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 10,
  },
  configBlock: {
    backgroundColor: "transparent",
  },
  configItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  configText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },

  footer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  botao: {
    backgroundColor: "#0F14B8",
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: "center",
    width: "100%",
  },
  textoBotao: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
