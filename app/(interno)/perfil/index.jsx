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
  const [modalPlanoVisivel, setModalPlanoVisivel] = useState(false);

  const router = useRouter();
  const [ocultarSenhaAtual, setOcultarSenhaAtual] = useState(true);
  const [ocultarNovaSenha, setOcultarNovaSenha] = useState(true);
  const [ocultarConfirmarSenha, setOcultarConfirmarSenha] = useState(true);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      global.showToast("error", "Preencha todos os campos!");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      global.showToast("error", "As senhas não coincidem!");
      return;
    }

    try {
      await global.executarComToast(
        () =>
          api.patch(
            `${ENDPOINTS.ALTERAR_SENHA}/${usuario?.userId}/${usuario?.empresaId}`,
            {
              senhaAtual,
              novaSenha,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          ),
        {
          loadingMsg: "Alterando senha...",
          successMsg: "Senha alterada com sucesso!",
          errorMsg: "Erro ao alterar senha!",
          onSuccess: () => {
            setModalVisivel(false);
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
          },

        }

      );
    } catch (error) {
      console.error(error);
    }
  };

  const isAnual = plano?.periodo?.toLowerCase() === "anual";

  const valorExibido = isAnual
    ? plano?.valorCobrado * 12
    : plano?.valorCobrado;

  const sufixo = isAnual ? "/ano" : "/mês";

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
            `${ENDPOINTS.EMPRESAS}/${usuarioSalvo?.empresaId}`,
            { headers: { Authorization: `Bearer ${tokenSalvo}` } }
          );
          setEmpresa(response.data);
          const responsePlano = await api.get(
            `${ENDPOINTS.GERENCIAMENTO_PLANO_EMPRESA}/${usuarioSalvo?.empresaId}`,
            { headers: { Authorization: `Bearer ${tokenSalvo}` } }
          );
          setPlano(responsePlano.data);
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
              <View style={styles.inputSenhaContainer}>
                <TextInput
                  placeholder="Digite sua senha"
                  secureTextEntry={ocultarSenhaAtual}
                  value={senhaAtual}
                  onChangeText={setSenhaAtual}
                  style={[styles.inputSenha, { outlineStyle: "none" }]}
                />
                <Pressable onPress={() => setOcultarSenhaAtual(prev => !prev)}>
                  <Ionicons
                    name={ocultarSenhaAtual ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </Pressable>
              </View>
            </View>

            <View>
              <Text>Nova senha:</Text>
              <View style={styles.inputSenhaContainer}>
                <TextInput
                  placeholder="Digite sua nova senha"
                  secureTextEntry={ocultarNovaSenha}
                  value={novaSenha}
                  onChangeText={setNovaSenha}
                  style={styles.inputSenha}
                />
                <Pressable onPress={() => setOcultarNovaSenha(prev => !prev)}>
                  <Ionicons
                    name={ocultarNovaSenha ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </Pressable>
              </View>
            </View>

            <View>
              <Text>Confirmar nova senha:</Text>
              <View style={styles.inputSenhaContainer}>
                <TextInput
                  placeholder="Confirme sua nova senha"
                  secureTextEntry={ocultarConfirmarSenha}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  style={styles.inputSenha}
                />
                <Pressable onPress={() => setOcultarConfirmarSenha(prev => !prev)}>
                  <Ionicons
                    name={ocultarConfirmarSenha ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#999"
                  />
                </Pressable>
              </View>
            </View>


            <View style={{ marginTop: 45, gap: 15, justifyContent: "space-between" }}>
              <Pressable
                style={{
                  backgroundColor: "#0F14B8",
                  padding: 12,
                  borderRadius: 6,
                  alignItems: "center",
                }}
                onPress={handleAlterarSenha}
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


        {modalPlanoVisivel && plano && (
          <Modal titulo="Seu Plano" onClose={() => setModalPlanoVisivel(false)}>

            <View style={styles.cardPlano}>

              <Text style={[
                styles.status,
                { backgroundColor: plano.ativo ? "#C8E6C9" : "#FFCDD2" }
              ]}>
                {plano.ativo ? "Ativo" : "Inativo"}
              </Text>

              <Text style={styles.tituloPlano}>
                {plano.planoTemplate?.tipo}
              </Text>

              <Text style={styles.descricaoPlano}>
                {plano.planoTemplate?.descricao}
              </Text>

              <Text style={styles.preco}>
                R$ {valorExibido?.toFixed(2).replace(".", ",")}
                <Text style={styles.periodo}>{sufixo} </Text>
              </Text>

              <View style={styles.datas}>
                <Text>Início: {formatarData(plano.dataInicio)}</Text>
                <Text>Vencimento: {formatarData(plano.dataFim)}</Text>
              </View>

              <View style={styles.lista}>
                <Text>✔️ {plano.planoTemplate?.qtdUsuarios} Usuários</Text>
                <Text>✔️ {plano.planoTemplate?.qtdSuperUsuarios} Super Usuários</Text>
                <Text>
                  {plano.planoTemplate?.acessoDashboard ? "✔️" : "❌"} Dashboard
                </Text>
                <Text>
                  {plano.planoTemplate?.acessoRelatorioWhatsApp ? "✔️" : "❌"} WhatsApp
                </Text>
              </View>

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
            onPress={() => setModalPlanoVisivel(true)}
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
  inputSenhaContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  inputSenha: {
    flex: 1,
    paddingVertical: 10,
    outlineStyle: "none",
    outlineWidth: 0,
    outline: "none",
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
  cardPlano: {
    backgroundColor: "#F8F8F8",
    borderRadius: 16,
    padding: 16,
  },
  status: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 10,
  },
  tituloPlano: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 4,
  },
  descricaoPlano: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  preco: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F14B8",
    marginBottom: 10,
  },
  periodo: {
    fontSize: 16,
    color: "#000000d9",
    marginBottom: 10,
    fontWeight: "400",
  },
  datas: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  lista: {
    gap: 6,
  },
});
