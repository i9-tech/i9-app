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
  salvarIdioma, 
} from "../../../utils/storage";
import { useRouter } from "expo-router";
import { ENDPOINTS } from "../../../utils/endpoints";
import api from "../../../provider/api";
import Modal from "../../../components/Modal";
import { formatarData, formatarTelefone } from "../../../utils/auxiliar";
import { useTranslation } from "react-i18next";

export default function Perfil() {
  const { t, i18n } = useTranslation();
  const [usuario, setUsuario] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [plano, setPlano] = useState(null);
  const [token, setToken] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalPlanoVisivel, setModalPlanoVisivel] = useState(false);
  const [modalIdiomaVisivel, setModalIdiomaVisivel] = useState(false);

  const router = useRouter();
  const [ocultarSenhaAtual, setOcultarSenhaAtual] = useState(true);
  const [ocultarNovaSenha, setOcultarNovaSenha] = useState(true);
  const [ocultarConfirmarSenha, setOcultarConfirmarSenha] = useState(true);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleAlterarSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      global.showToast("error", t("perfil.erro_campos"));
      return;
    }

    if (novaSenha !== confirmarSenha) {
      global.showToast("error", t("perfil.erro_senhas"));
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
          loadingMsg: t("perfil.msg_alterando"),
          successMsg: t("perfil.sucesso_senha"),
          errorMsg: t("perfil.erro_senha"),
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

  const handleMudarIdioma = async (lang) => {
    i18n.changeLanguage(lang);
    await salvarIdioma(lang);
    setModalIdiomaVisivel(false);
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
    global.setHeaderTitulo(t("perfil.header_titulo"));
    global.setHeaderSubTitulo(t("perfil.header_subtitulo"));
  }, [t]);

  const isAnual = plano?.periodo?.toLowerCase() === "anual";
  const valorExibido = isAnual ? (plano?.valorCobrado * 12) : plano?.valorCobrado;
  const sufixo = isAnual ? t("perfil.por_ano") : t("perfil.por_mes");

  const idiomasList = [
    { code: "pt", label: t("perfil.idioma_pt") },
    { code: "en", label: t("perfil.idioma_en") },
    { code: "es", label: t("perfil.idioma_es") }
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* MODAL ALTERAR SENHA */}
          {modalVisivel && (
            <Modal titulo={t("perfil.editar_senha")} onClose={() => setModalVisivel(false)}>
              <View style={styles.modalBody}>
                <Text style={styles.modalLabel}>{t("perfil.senha_atual")}</Text>
                <View style={styles.inputSenhaContainer}>
                  <TextInput
                    placeholder={t("perfil.placeholder_senha")}
                    secureTextEntry={ocultarSenhaAtual}
                    value={senhaAtual}
                    onChangeText={setSenhaAtual}
                    style={styles.inputSenha}
                  />
                  <Pressable onPress={() => setOcultarSenhaAtual(!ocultarSenhaAtual)}>
                    <Ionicons name={ocultarSenhaAtual ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                  </Pressable>
                </View>

                <Text style={styles.modalLabel}>{t("perfil.nova_senha")}</Text>
                <View style={styles.inputSenhaContainer}>
                  <TextInput
                    placeholder={t("perfil.placeholder_nova_senha")}
                    secureTextEntry={ocultarNovaSenha}
                    value={novaSenha}
                    onChangeText={setNovaSenha}
                    style={styles.inputSenha}
                  />
                  <Pressable onPress={() => setOcultarNovaSenha(!ocultarNovaSenha)}>
                    <Ionicons name={ocultarNovaSenha ? "eye-off-outline" : "eye-outline"} size={20} color="#999" />
                  </Pressable>
                </View>

                <Text style={styles.modalLabel}>{t("perfil.confirmar_senha")}</Text>
                <View style={styles.inputSenhaContainer}>
                  <TextInput
                    placeholder={t("perfil.placeholder_confirmar")}
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
                    <Text style={styles.btnTextWhite}>{t("perfil.salvar")}</Text>
                  </Pressable>
                  <Pressable style={styles.btnCancelar} onPress={() => setModalVisivel(false)}>
                    <Text style={styles.btnTextBlack}>{t("perfil.cancelar")}</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}

          {/* MODAL VISUALIZAR PLANO */}
          {modalPlanoVisivel && plano && (
            <Modal titulo={t("perfil.seu_plano")} onClose={() => setModalPlanoVisivel(false)}>
              <View style={styles.cardPlano}>
                <Text style={[styles.status, { backgroundColor: plano.ativo ? "#C8E6C9" : "#FFCDD2" }]}>
                  {plano.ativo ? t("perfil.ativo") : t("perfil.inativo")}
                </Text>
                <Text style={styles.tituloPlano}>{plano.planoTemplate?.tipo}</Text>
                <Text style={styles.descricaoPlano}>{plano.planoTemplate?.descricao}</Text>
                <Text style={styles.preco}>
                  {(valorExibido || 0).toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' })}
                  <Text style={styles.periodo}>{sufixo}</Text>
                </Text>
                <View style={styles.datas}>
                  <Text style={styles.value}>{t("perfil.inicio")} {formatarData(plano.dataInicio)}</Text>
                  <Text style={styles.value}>{t("perfil.vencimento")} {formatarData(plano.dataFim)}</Text>
                </View>
                <View style={styles.lista}>
                  <Text style={styles.value}>✔️ {plano.planoTemplate?.qtdUsuarios} {t("perfil.usuarios")}</Text>
                  <Text style={styles.value}>✔️ {plano.planoTemplate?.qtdSuperUsuarios} {t("perfil.super_usuarios")}</Text>
                  <Text style={styles.value}>{plano.planoTemplate?.acessoDashboard ? "✔️" : "❌"} {t("perfil.dashboard")}</Text>
                  <Text style={styles.value}>{plano.planoTemplate?.acessoRelatorioWhatsApp ? "✔️" : "❌"} {t("perfil.whatsapp")}</Text>
                </View>
              </View>
            </Modal>
          )}

          {/* MODAL ALTERAR IDIOMA */}
          {modalIdiomaVisivel && (
            <Modal titulo={t("perfil.selecionar_idioma")} onClose={() => setModalIdiomaVisivel(false)}>
              <View style={styles.modalBody}>
                {idiomasList.map((lang) => (
                  <Pressable
                    key={lang.code}
                    style={[
                      styles.idiomaItem,
                      i18n.language === lang.code && styles.idiomaItemAtivo
                    ]}
                    onPress={() => handleMudarIdioma(lang.code)}
                  >
                    <Text style={[
                      styles.idiomaTexto,
                      i18n.language === lang.code && styles.idiomaTextoAtivo
                    ]}>
                      {lang.label}
                    </Text>
                    {i18n.language === lang.code && (
                      <Ionicons name="checkmark-circle" size={24} color="#0F14B8" />
                    )}
                  </Pressable>
                ))}
              </View>
            </Modal>
          )}

          {/* HEADER PERFIL */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={50} color="#666" />
            </View>
            <Text style={styles.nomeUsuario}>{usuario?.nome ?? t("perfil.carregando")}</Text>
            <Text style={styles.nomeEmpresa}>{empresa?.nome ?? t("perfil.carregando")}</Text>
          </View>

          {/* SEÇÃO DE INFORMAÇÕES */}
          <View style={styles.infoSection}>
            <View style={[styles.card, styles.cardCol]}>
              <View style={styles.cardRow}>
                <Text style={styles.label}>{t("perfil.conta_criada")}</Text>
                <Text style={styles.value}>{formatarData(plano?.dataAdesao) ?? "---"}</Text>
              </View>
              <View style={[styles.cardRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.label}>{t("perfil.plano_label")}</Text>
                <Text style={styles.value}>{empresa?.nomePlano ?? "---"}</Text>
              </View>
            </View>

            {[
              { label: t("perfil.email"), val: empresa?.email },
              { label: t("perfil.telefone"), val: formatarTelefone(empresa?.whatsapp) },
              { label: t("perfil.estabelecimento"), val: empresa?.endereco },
              { label: t("perfil.cnpj"), val: empresa?.cnpj }
            ].map((item, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.value}>{item.val ?? "---"}</Text>
              </View>
            ))}
          </View>

          {/* CONFIGURAÇÕES */}
          <View style={styles.configSection}>
            <Text style={styles.configTitle}>{t("perfil.configuracoes")}</Text>
            <Pressable style={styles.configItem} onPress={() => setModalVisivel(true)}>
              <Text style={styles.configText}>{t("perfil.alterar_senha")}</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </Pressable>
            <Pressable style={styles.configItem} onPress={() => setModalPlanoVisivel(true)}>
              <Text style={styles.configText}>{t("perfil.visualizar_plano")}</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </Pressable>
            <Pressable style={styles.configItem} onPress={() => setModalIdiomaVisivel(true)}>
              <Text style={styles.configText}>{t("perfil.alterar_idioma")}</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.botaoSair} onPress={() => removerUsuario().then(() => router.push("/"))}>
              <Text style={styles.textoBotao}>{t("perfil.sair")}</Text>
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
  
  modalBody: { paddingBottom: 10 },
  modalLabel: { fontSize: 14, marginBottom: 5, color: "#555" },
  inputSenhaContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#DDD", borderRadius: 8, paddingHorizontal: 12, marginBottom: 15, backgroundColor: "#F9F9F9" },
  inputSenha: { flex: 1, paddingVertical: 12, fontSize: 16, color: "#333" },
  modalFooter: { marginTop: 20, gap: 10 },
  btnSalvar: { backgroundColor: "#0F14B8", padding: 14, borderRadius: 8, alignItems: "center" },
  btnCancelar: { backgroundColor: "#EEE", padding: 14, borderRadius: 8, alignItems: "center" },
  btnTextWhite: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnTextBlack: { color: "#333", fontWeight: "bold", fontSize: 16 },

  cardPlano: { backgroundColor: "#FFF", borderRadius: 12, padding: 20, elevation: 3 },
  status: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, fontSize: 12, fontWeight: "bold", color: "#2E7D32", marginBottom: 10 },
  tituloPlano: { fontSize: 22, fontWeight: "bold", color: "#111" },
  descricaoPlano: { fontSize: 14, color: "#666", marginVertical: 8 },
  preco: { fontSize: 24, fontWeight: "bold", color: "#0F14B8", marginVertical: 10 },
  periodo: { fontSize: 14, color: "#777", fontWeight: "normal" },
  datas: { flexDirection: "column", gap: 5, marginVertical: 15, borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 10 },
  lista: { gap: 8 },
  idiomaItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  idiomaItemAtivo: { backgroundColor: "#F0F0FF", borderRadius: 8, borderBottomWidth: 0 },
  idiomaTexto: { fontSize: 16, color: "#444" },
  idiomaTextoAtivo: { color: "#0F14B8", fontWeight: "bold" }
});