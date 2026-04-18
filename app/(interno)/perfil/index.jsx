import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  buscarUsuario,
  recuperarToken,
  removerUsuario,
} from "../../../utils/storage";
import { useRouter } from "expo-router";
import { ENDPOINTS } from "../../../utils/endpoints";
import api from "../../../provider/api";
import Modal from "../../../components/Modal";
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
            { senhaAtual, novaSenha },
            { headers: { Authorization: `Bearer ${token}` } }
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

  useEffect(() => {
    async function carregarDados() {
      try {
        const usuarioSalvo = await buscarUsuario();
        const tokenSalvo = await recuperarToken();
        setUsuario(usuarioSalvo);
        setToken(tokenSalvo);

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

  const isAnual = plano?.periodo?.toLowerCase() === "anual";
  const valorExibido = isAnual ? plano?.valorCobrado * 12 : plano?.valorCobrado;
  const sufixo = isAnual ? "/ano" : "/mês";

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* MODAL ALTERAR SENHA */}
          {modalVisivel && (
            <Modal titulo="Editar Senha" onClose={() => setModalVisivel(false)}>
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>Senha atual:</Text>
                <View style={styles.inputSenhaContainer}>
                  <TextInput
                    placeholder="Digite sua senha"
                    secureTextEntry={ocultarSenhaAtual}
                    value={senhaAtual}
                    onChangeText={setSenhaAtual}
                    style={styles.inputSenha}
                  />
                  <Pressable onPress={() => setOcultarSenhaAtual(!ocultarSenhaAtual)}>
                    <Ionicons name={ocultarSenhaAtual ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                  </Pressable>
                </View>

                <Text style={styles.modalLabel}>Nova senha:</Text>
                <View style={styles.inputSenhaContainer}>
                  <TextInput
                    placeholder="Digite sua nova senha"
                    secureTextEntry={ocultarNovaSenha}
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    style={styles.inputSenha}
                  />
                  <Pressable onPress={() => setOcultarNovaSenha(!ocultarNovaSenha)}>
                    <Ionicons name={ocultarNovaSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                  </Pressable>
                </View>

                <Text style={styles.modalLabel}>Confirmar nova senha:</Text>
                <View style={styles.inputSenhaContainer}>
                  <TextInput
                    placeholder="Confirme sua nova senha"
                    secureTextEntry={ocultarConfirmarSenha}
                    value={confirmarSenha}
                    onChangeText={setConfirmarSenha}
                    style={styles.inputSenha}
                  />
                  <Pressable onPress={() => setOcultarConfirmarSenha(!ocultarConfirmarSenha)}>
                    <Ionicons name={ocultarConfirmarSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                  </Pressable>
                </View>

                <View style={styles.modalFooter}>
                  <Pressable style={styles.btnSalvar} onPress={handleAlterarSenha}>
                    <Text style={styles.btnTextWhite}>Salvar Alterações</Text>
                  </Pressable>
                  <Pressable style={styles.btnCancelar} onPress={() => setModalVisivel(false)}>
                    <Text style={styles.btnTextBlack}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}

          {/* MODAL VISUALIZAR PLANO */}
          {modalPlanoVisivel && plano && (
            <Modal titulo="Seu Plano" onClose={() => setModalPlanoVisivel(false)}>
              <View style={styles.cardPlano}>
                <Text style={[styles.status, { backgroundColor: plano.ativo ? "#C8E6C9" : "#FFCDD2" }]}>
                  {plano.ativo ? "Ativo" : "Inativo"}
                </Text>
                <Text style={styles.tituloPlano}>{plano.planoTemplate?.tipo}</Text>
                <Text style={styles.descricaoPlano}>{plano.planoTemplate?.descricao}</Text>
                <Text style={styles.preco}>
                  R$ {valorExibido?.toFixed(2).replace(".", ",")}
                  <Text style={styles.periodo}>{sufixo}</Text>
                </Text>
                <View style={styles.datas}>
                  <Text style={styles.value}>Início: {formatarData(plano.dataInicio)}</Text>
                  <Text style={styles.value}>Vencimento: {formatarData(plano.dataFim)}</Text>
                </View>
                <View style={styles.lista}>
                  <Text style={styles.value}>✔️ {plano.planoTemplate?.qtdUsuarios} Usuários</Text>
                  <Text style={styles.value}>✔️ {plano.planoTemplate?.qtdSuperUsuarios} Super Usuários</Text>
                  <Text style={styles.value}>{plano.planoTemplate?.acessoDashboard ? "✔️" : "❌"} Dashboard</Text>
                  <Text style={styles.value}>{plano.planoTemplate?.acessoRelatorioWhatsApp ? "✔️" : "❌"} WhatsApp</Text>
                </View>
              </View>
            </Modal>
          )}

          {/* HEADER PERFIL */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={50} color="#666" />
            </View>
            <Text style={styles.nomeUsuario}>{usuario?.nome ?? "Carregando..."}</Text>
            <Text style={styles.nomeEmpresa}>{empresa?.nome ?? "Carregando..."}</Text>
          </View>

          {/* SEÇÃO DE INFORMAÇÕES */}
          <View style={styles.infoSection}>
            <View style={[styles.card, styles.cardCol]}>
              <View style={styles.cardRow}>
                <Text style={styles.label}>📅 Conta criada em:</Text>
                <Text style={styles.value}>{formatarData(plano?.dataAdesao) ?? "---"}</Text>
              </View>
              <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.label}>💼 Plano:</Text>
                <Text style={styles.value}>{empresa?.nomePlano ?? "---"}</Text>
              </View>
            </View>

            {[
              { label: "Email:", val: empresa?.email },
              { label: "Telefone:", val: formatarTelefone(empresa?.whatsapp) },
              { label: "Estabelecimento:", val: empresa?.endereco },
              { label: "CNPJ:", val: empresa?.cnpj }
            ].map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.val ?? "---"}</Text>
              </View>
            ))}
          </View>

          {/* CONFIGURAÇÕES */}
          <View style={styles.configSection}>
            <Text style={styles.configTitle}>Configurações</Text>
            <Pressable style={styles.configItem} onPress={() => setModalVisivel(true)}>
              <Text style={styles.configText}>🔒 Alterar senha</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </Pressable>
            <Pressable style={styles.configItem} onPress={() => setModalPlanoVisivel(true)}>
              <Text style={styles.configText}>📦 Visualizar plano</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.botaoSair} onPress={() => removerUsuario().then(() => router.push("/"))}>
              <Text style={styles.textoBotao}>Sair da Conta</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F4F4F4" },
  scrollContent: { paddingBottom: 40 },
  header: { alignItems: "center", paddingTop: 30, paddingBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#E0E0E0", justifyContent: "center", alignItems: "center", marginBottom: 15 },
  nomeUsuario: { fontSize: 20, fontWeight: "bold", color: "#111" },
  nomeEmpresa: { fontSize: 16, color: "#666", marginTop: 2 },
  infoSection: { paddingHorizontal: 20 },
  card: { backgroundColor: "#FFF", padding: 15, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, elevation: 2 },
  cardCol: { flexDirection: "column", alignItems: "stretch" },
  cardRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  label: { fontSize: 14, color: "#777" },
  value: { fontSize: 14, color: "#333", fontWeight: "500" },
  configSection: { paddingHorizontal: 20, marginTop: 20 },
  configTitle: { fontSize: 18, fontWeight: "bold", color: "#111", marginBottom: 10 },
  configItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  configText: { fontSize: 16, color: "#333" },
  footer: { paddingHorizontal: 20, marginTop: 30 },
  botaoSair: { backgroundColor: "#0F14B8", paddingVertical: 15, borderRadius: 8, alignItems: "center" },
  textoBotao: { color: "white", fontSize: 16, fontWeight: "bold" },
  
  // MODAL STYLES
  modalBody: { paddingBottom: 10 },
  modalLabel: { fontSize: 14, marginBottom: 5, color: "#555" },
  inputSenhaContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DDD", borderRadius: 8, paddingHorizontal: 12, marginBottom: 15, backgroundColor: "#F9F9F9" },
  inputSenha: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#333" },
  modalFooter: { marginTop: 20, gap: 10 },
  btnSalvar: { backgroundColor: "#0F14B8", padding: 14, borderRadius: 8, alignItems: "center" },
  btnCancelar: { backgroundColor: "#EEE", padding: 14, borderRadius: 8, alignItems: "center" },
  btnTextWhite: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnTextBlack: { color: "#333", fontWeight: "bold", fontSize: 16 },

  // PLAN CARD
  cardPlano: { backgroundColor: "#FFF", borderRadius: 12, padding: 20, elevation: 3 },
  status: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: "bold", color: "#2E7D32", marginBottom: 10 },
  tituloPlano: { fontSize: 22, fontWeight: "bold", color: "#111" },
  descricaoPlano: { fontSize: 14, color: "#666", marginVertical: 8 },
  preco: { fontSize: 24, fontWeight: "bold", color: "#0F14B8", marginVertical: 10 },
  periodo: { fontSize: 14, color: "#777", fontWeight: "normal" },
  datas: { flexDirection: "column", gap: 5, marginVertical: 15, borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 10 },
  lista: { gap: 8 }
});