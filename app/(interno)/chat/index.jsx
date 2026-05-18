import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import api_ia from "../../../provider/api_ia";
import api from "../../../provider/api";
import { recuperarToken, buscarUsuario } from "../../../utils/storage";
import { ENDPOINTS } from "../../../utils/endpoints";
import { useTranslation } from "react-i18next";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Chat() {
  const { t } = useTranslation();
  const sugestoes = t("chat.sugestoes", { returnObjects: true }) || [];

  const [token, setToken] = useState(null);
  const [funcionario, setFuncionario] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatSelecionado, setChatSelecionado] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [textoAtual, setTextoAtual] = useState("");
  const [isLoadingIA, setIsLoadingIA] = useState(false);

  const [modalMenuListVisivel, setModalMenuListVisivel] = useState(false);
  const [modalEditarVisivel, setModalEditarVisivel] = useState(false);
  const [chatEmFoco, setChatEmFoco] = useState(null);
  const [novoNomeChat, setNovoNomeChat] = useState("");

  const [modalMenuChatVisivel, setModalMenuChatVisivel] = useState(false);

  const [modalAlertaVisivel, setModalAlertaVisivel] = useState(false);
  const [alertaProps, setAlertaProps] = useState({
    titulo: "",
    mensagem: "",
    botoes: [],
  });

  const [modoSelecao, setModoSelecao] = useState(false);
  const [chatsParaApagar, setChatsParaApagar] = useState([]);
  const [isApagandoMultiplos, setIsApagandoMultiplos] = useState(false);

  const scrollViewRef = useRef();

  useEffect(() => {
    if (chatSelecionado) {
      global.setHeaderTitulo(
        chatSelecionado.nomeChat || t("chat.chat_padrao", { id: chatSelecionado.id }),
      );
      global.setHeaderSubTitulo(t("chat.header_subtitulo_chat"));
    } else {
      global.setHeaderTitulo(t("chat.header_titulo_lista"));
      global.setHeaderSubTitulo(t("chat.header_subtitulo_lista"));
    }
  }, [chatSelecionado, t]);

  useEffect(() => {
    async function carregarDadosIniciais() {
      const t = await recuperarToken();
      const f = await buscarUsuario();
      setToken(t);
      setFuncionario(f);

      if (f?.userId && t) {
        buscarChats(f.userId, t);
      }
    }
    carregarDadosIniciais();
  }, []);

  const getAuthHeader = (currentToken = token) => ({
    headers: { Authorization: `Bearer ${currentToken}` },
  });

  const chatsOrdenados = [...chats].sort((a, b) => {
    if (a.dtFixado && !b.dtFixado) return -1;
    if (!a.dtFixado && b.dtFixado) return 1;
    if (a.dtFixado && b.dtFixado) {
      return new Date(b.dtFixado) - new Date(a.dtFixado);
    }
    return b.id - a.id;
  });

  const exibirAlerta = (titulo, mensagem, botoes) => {
    const botoesPadrao = botoes || [
      { text: "OK", onPress: () => setModalAlertaVisivel(false) },
    ];
    setAlertaProps({ titulo, mensagem, botoes: botoesPadrao });
    setModalAlertaVisivel(true);
  };

  const renderModalAlerta = () => (
    <Modal visible={modalAlertaVisivel} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalAlertContent}>
          <Text style={styles.modalAlertTitle}>{alertaProps.titulo}</Text>
          <Text style={styles.modalAlertMessage}>{alertaProps.mensagem}</Text>
          <View style={styles.modalAlertButtons}>
            {alertaProps.botoes.map((btn, index) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalAlertBtn,
                    isCancel
                      ? styles.modalAlertBtnCancel
                      : isDestructive
                        ? styles.modalAlertBtnDestructive
                        : styles.modalAlertBtnDefault,
                    alertaProps.botoes.length > 1 && index === 0
                      ? { marginRight: 10 }
                      : {},
                  ]}
                  onPress={() => {
                    setModalAlertaVisivel(false);
                    if (btn.onPress) btn.onPress();
                  }}
                >
                  <Text
                    style={[
                      styles.modalAlertBtnText,
                      isCancel
                        ? styles.modalAlertBtnTextCancel
                        : isDestructive
                          ? styles.modalAlertBtnTextDestructive
                          : styles.modalAlertBtnTextDefault,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );

  const buscarChats = async (idFuncionario, currentToken) => {
    try {
      const res = await api.get(
        `${ENDPOINTS.CHAT_IA}/${idFuncionario}`,
        getAuthHeader(currentToken),
      );
      setChats(res.data);
    } catch (err) {
      console.error("Erro ao buscar chats: ", err);
    }
  };

  const criarNovoChat = async () => {
    if (!funcionario?.userId) return;
    try {
      const res = await api.post(
        `${ENDPOINTS.CHAT_IA}/${funcionario.userId}`,
        {},
        getAuthHeader(),
      );
      const novoChat = res.data;
      setChats((prev) => [...prev, novoChat]);
      selecionarChat(novoChat);
    } catch (err) {
      exibirAlerta(t("chat.erro"), t("chat.erro_criar_chat"));
      console.error(err);
    }
  };

  const selecionarChat = async (chat) => {
    setChatSelecionado(chat);
    try {
      const res = await api.get(
        `${ENDPOINTS.MENSAGEM_IA}/${funcionario.userId}/${chat.id}`,
        getAuthHeader(),
      );
      setMensagens(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar mensagens: ", err);
      setMensagens([]);
    }
  };

  const voltarParaLista = () => {
    setChatSelecionado(null);
    setMensagens([]);
    buscarChats(funcionario.userId, token);
  };

  const abrirOpcoesLista = (chat) => {
    setChatEmFoco(chat);
    setModalMenuListVisivel(true);
  };

  const fixarChatAtual = async () => {
    setModalMenuListVisivel(false);
    try {
      await api.patch(
        `${ENDPOINTS.CHAT_IA_FIXAR_CHAT}/${chatEmFoco.id}/${funcionario.userId}`,
        {},
        getAuthHeader(),
      );
      buscarChats(funcionario.userId);
    } catch (err) {
      const mensagemErro = err.response?.data?.message || t("chat.erro_fixar_chat");
      exibirAlerta(t("chat.aviso"), mensagemErro);
    }
  };

  const confirmarApagarChat = () => {
    setModalMenuListVisivel(false);
    exibirAlerta(
      t("chat.apagar_chat_titulo"),
      t("chat.apagar_chat_msg"),
      [
        { text: t("chat.cancelar"), style: "cancel" },
        {
          text: t("chat.sim_apagar"),
          style: "destructive",
          onPress: () => apagarChat(chatEmFoco.id),
        },
      ],
    );
  };

  const apagarChat = async (chatId) => {
    try {
      await api.delete(
        `${ENDPOINTS.CHAT_IA}/${chatId}/${funcionario.userId}`,
        getAuthHeader(),
      );
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      exibirAlerta(t("chat.erro"), t("chat.erro_apagar_chat"));
    }
  };

  const iniciarModoSelecao = () => {
    setModalMenuListVisivel(false);
    setModoSelecao(true);
    setChatsParaApagar([]);
  };

  const toggleSelecaoChat = (id) => {
    setChatsParaApagar((prev) =>
      prev.includes(id) ? prev.filter((chatId) => chatId !== id) : [...prev, id]
    );
  };

  const confirmarApagarMultiplos = () => {
    if (chatsParaApagar.length === 0) {
      exibirAlerta(t("chat.aviso"), t("chat.selecione_chat_excluir"));
      return;
    }
    exibirAlerta(
      t("chat.apagar_varios_titulo"),
      t("chat.apagar_varios_msg", { count: chatsParaApagar.length }),
      [
        { text: t("chat.cancelar"), style: "cancel" },
        {
          text: t("chat.excluir_todos"),
          style: "destructive",
          onPress: () => apagarChatsSelecionados(),
        },
      ],
    );
  };

  const apagarChatsSelecionados = async () => {
    setIsApagandoMultiplos(true);
    let houveErro = false;

    try {
      for (const id of chatsParaApagar) {
        await api.delete(`${ENDPOINTS.CHAT_IA}/${id}/${funcionario.userId}`, getAuthHeader());
        await sleep(600);
      }
      
      setChats((prev) => prev.filter((c) => !chatsParaApagar.includes(c.id)));
    } catch (err) {
      console.error("Erro ao apagar múltiplos chats", err);
      houveErro = true;
    } finally {
      setIsApagandoMultiplos(false);
      setModoSelecao(false);
      setChatsParaApagar([]);
      
      if (houveErro) {
        exibirAlerta(t("chat.aviso"), t("chat.erro_apagar_varios"));
        buscarChats(funcionario.userId, token);
      } else {
        exibirAlerta(t("chat.sucesso"), t("chat.sucesso_apagar_varios"));
      }
    }
  };

  const abrirModalEditar = () => {
    setModalMenuListVisivel(false);
    setNovoNomeChat(chatEmFoco?.nomeChat || "");
    setTimeout(() => setModalEditarVisivel(true), 300);
  };

  const salvarNovoNomeChat = async () => {
    if (!novoNomeChat.trim()) {
      exibirAlerta(t("chat.aviso"), t("chat.erro_nome_vazio"));
      return;
    }
    try {
      await api.patch(
        `${ENDPOINTS.CHAT_IA_ATUALIZAR_NOME}/${chatEmFoco.id}/${funcionario.userId}`,
        {
          nomeChat: novoNomeChat,
        },
        getAuthHeader(),
      );

      setModalEditarVisivel(false);
      buscarChats(funcionario.userId);
    } catch (err) {
      exibirAlerta(t("chat.erro"), t("chat.erro_renomear"));
    }
  };

  const confirmarApagarMensagens = () => {
    setModalMenuChatVisivel(false);
    exibirAlerta(
      t("chat.limpar_historico_titulo"),
      t("chat.limpar_historico_msg"),
      [
        { text: t("chat.cancelar"), style: "cancel" },
        {
          text: t("chat.limpar"),
          style: "destructive",
          onPress: () => apagarMensagens(),
        },
      ],
    );
  };

  const apagarMensagens = async () => {
    try {
      const res = await api.delete(
        `${ENDPOINTS.MENSAGEM_IA}/${funcionario.userId}/${chatSelecionado.id}`,
        getAuthHeader(),
      );
      if (res.status === 200) {
        buscarMensagens(funcionario.userId, chatSelecionado.id);
      }
    } catch (err) {
      exibirAlerta(t("chat.erro"), t("chat.erro_limpar_mensagens"));
    }
  };

  const buscarMensagens = async (userId, chatId) => {
    try {
      const res = await api.get(
        `${ENDPOINTS.MENSAGEM_IA}/${userId}/${chatId}`,
        getAuthHeader(),
      );
      setMensagens(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar mensagens: ", err);
      setMensagens([]);
    }
  };

  function obterHoraAtual() {
    const data = new Date();
    const horas = data.getHours().toString().padStart(2, "0");
    const minutos = data.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  const enviarMensagem = async (texto) => {
    if (!texto.trim() || !chatSelecionado) return;

    const textoFormatado = texto.trim();
    setTextoAtual("");

    const novaMensagemUsuario = {
      id: Date.now().toString(),
      tipo: "user",
      texto: textoFormatado,
      hora: obterHoraAtual(),
    };
    setMensagens((prev) => [...prev, novaMensagemUsuario]);

    try {
      await api.post(
        `${ENDPOINTS.MENSAGEM_IA}/${funcionario.userId}/${chatSelecionado.id}`,
        {
          texto: textoFormatado,
          tipo: "user",
        },
        getAuthHeader(),
      );
    } catch (err) {
      console.error(err);
    }

    setIsLoadingIA(true);

    try {
      const response = await api_ia.post(
        "/api/chat",
        {
          id_usuario: funcionario.userId.toString(),
          pergunta: textoFormatado,
          token: token,
          empresa_id: funcionario.empresaId,
        },
        getAuthHeader(),
      );

      const textoResposta = response.data.resposta;

      await api.post(
        `${ENDPOINTS.MENSAGEM_IA}/${funcionario.userId}/${chatSelecionado.id}`,
        {
          texto: textoResposta,
          tipo: "bot",
        },
        getAuthHeader(),
      );

      const mensagemBot = {
        id: (Date.now() + 1).toString(),
        tipo: "bot",
        texto: textoResposta,
        hora: obterHoraAtual(),
      };
      setMensagens((prev) => [...prev, mensagemBot]);
    } catch (err) {
      const mensagemErro = {
        id: (Date.now() + 1).toString(),
        tipo: "bot",
        texto: t("chat.erro_processar_pergunta"),
        hora: obterHoraAtual(),
      };
      setMensagens((prev) => [...prev, mensagemErro]);
    } finally {
      setIsLoadingIA(false);
    }
  };

  if (!chatSelecionado) {
    return (
      <View style={styles.safe}>
        <View style={styles.listHeaderContainer}>
          <TouchableOpacity
            style={styles.novoChatBtnBig}
            onPress={criarNovoChat}
            disabled={modoSelecao}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.novoChatTextBig}>{t("chat.criar_novo_chat")}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.fullListContainer}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {chatsOrdenados.length === 0 ? (
            <Text style={styles.emptyStateText}>{t("chat.nenhum_chat")}</Text>
          ) : (
            chatsOrdenados.map((chat) => (
              <TouchableOpacity
                key={chat.id}
                style={[
                  styles.chatListItem,
                  modoSelecao && chatsParaApagar.includes(chat.id) && { borderColor: '#D9534F', borderWidth: 1 }
                ]}
                onPress={() => {
                  if (modoSelecao) {
                    toggleSelecaoChat(chat.id);
                  } else {
                    selecionarChat(chat);
                  }
                }}
              >
                <View style={styles.chatListInfo}>
                  <Ionicons
                    name="chatbubbles"
                    size={24}
                    color={chat.dtFixado ? "#1117B1" : "#888"}
                  />
                  <View style={styles.chatListTextContainer}>
                    <View style={styles.titleRow}>
                      <Text style={styles.chatListTitle} numberOfLines={1}>
                        {chat.nomeChat || t("chat.chat_padrao", { id: chat.id })}
                      </Text>

                      {chat.dtFixado && (
                        <Text style={styles.chatListPinnedText}>
                          {t("chat.chat_fixado")}
                        </Text>
                      )}
                    </View>

                    <Text style={styles.chatListSubtitle} numberOfLines={1}>
                      {chat.mensagemRecente
                        ? chat.mensagemRecente
                        : t("chat.nenhuma_mensagem")}
                    </Text>
                  </View>
                </View>

                {modoSelecao ? (
                  <TouchableOpacity
                    style={styles.optionsBtn}
                    onPress={() => toggleSelecaoChat(chat.id)}
                  >
                    <Ionicons
                      name={chatsParaApagar.includes(chat.id) ? "checkbox" : "square-outline"}
                      size={24}
                      color={chatsParaApagar.includes(chat.id) ? "#D9534F" : "#555"}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.optionsBtn}
                    onPress={() => abrirOpcoesLista(chat)}
                  >
                    <Ionicons name="ellipsis-vertical" size={20} color="#555" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {modoSelecao && (
          <View style={styles.selectionActionBar}>
            <TouchableOpacity 
              style={styles.btnCancelarSelecao} 
              onPress={() => {
                setModoSelecao(false);
                setChatsParaApagar([]);
              }}
            >
              <Text style={styles.btnTextCancelar}>{t("chat.cancelar")}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.btnExcluirSelecao,
                chatsParaApagar.length === 0 && { backgroundColor: '#F5A9A9' }
              ]} 
              onPress={confirmarApagarMultiplos}
              disabled={chatsParaApagar.length === 0}
            >
              <Text style={styles.btnTextExcluir}>
                {chatsParaApagar.length > 0 ? t("chat.excluir_contador", { count: chatsParaApagar.length }) : t("chat.excluir_todos_btn")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          visible={modalMenuListVisivel}
          transparent={true}
          animationType="fade"
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setModalMenuListVisivel(false)}
          >
            <View style={styles.modalMenuContent}>
              <Text style={styles.modalMenuTitle}>{t("chat.opcoes_chat")}</Text>

              <TouchableOpacity
                style={styles.modalMenuItem}
                onPress={fixarChatAtual}
              >
                <MaterialCommunityIcons
                  name={chatEmFoco?.dtFixado ? "pin-outline" : "pin"}
                  size={20}
                  color="#333"
                />
                <Text style={styles.modalMenuItemText}>
                  {chatEmFoco?.dtFixado ? t("chat.remover_fixacao") : t("chat.fixar_chat")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalMenuItem}
                onPress={abrirModalEditar}
              >
                <Ionicons name="pencil-outline" size={20} color="#333" />
                <Text style={styles.modalMenuItemText}>{t("chat.renomear_chat")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalMenuItem}
                onPress={iniciarModoSelecao}
              >
                <Ionicons name="checkbox-outline" size={20} color="#333" />
                <Text style={styles.modalMenuItemText}>
                  {t("chat.apagar_varios")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalMenuItem}
                onPress={confirmarApagarChat}
              >
                <Ionicons name="trash-outline" size={20} color="#D9534F" />
                <Text style={[styles.modalMenuItemText, { color: "#D9534F" }]}>
                  {t("chat.apagar_chat_titulo")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalMenuItem,
                  { borderBottomWidth: 0, justifyContent: "center" },
                ]}
                onPress={() => setModalMenuListVisivel(false)}
              >
                <Text style={{ color: "#888", fontWeight: "bold" }}>
                  {t("chat.cancelar")}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>

        <Modal
          visible={isApagandoMultiplos}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalAlertContent}>
              <ActivityIndicator size="large" color="#D9534F" />
              <Text style={[styles.modalAlertTitle, { marginTop: 15 }]}>{t("chat.excluindo_chats")}</Text>
              <Text style={styles.modalAlertMessage}>
                {t("chat.nao_feche_app")}
              </Text>
            </View>
          </View>
        </Modal>

        <Modal
          visible={modalEditarVisivel}
          transparent={true}
          animationType="slide"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <View style={styles.modalEditContent}>
              <Text style={styles.modalEditTitle}>{t("chat.renomear_chat")}</Text>
              <TextInput
                style={styles.modalEditInput}
                value={novoNomeChat}
                onChangeText={setNovoNomeChat}
                placeholder={t("chat.novo_nome_chat_placeholder")}
                autoFocus={true}
              />
              <View style={styles.modalEditButtons}>
                <TouchableOpacity
                  style={styles.modalEditBtnCancel}
                  onPress={() => setModalEditarVisivel(false)}
                >
                  <Text style={styles.modalEditBtnCancelText}>{t("chat.cancelar")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalEditBtnSave}
                  onPress={salvarNovoNomeChat}
                >
                  <Text style={styles.modalEditBtnSaveText}>{t("chat.salvar")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {renderModalAlerta()}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={voltarParaLista}>
          <Ionicons name="arrow-back" size={24} color="#1117B1" />
          <Text style={styles.backBtnText}>{t("chat.voltar")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setModalMenuChatVisivel(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.sugestoesContainer}>
        <Text style={styles.sugestoesLabel}>{t("chat.sugestoes_label")}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipsWrapper}>
            {Array.isArray(sugestoes) && sugestoes.map((item, index) => (
              <Pressable
                key={index}
                style={styles.chip}
                onPress={() => enviarMensagem(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        ref={scrollViewRef}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {mensagens.map((msg) => {
          const isBot = msg.tipo === "bot";
          return (
            <View key={msg.id} style={styles.messageWrapper}>
              <View
                style={[
                  styles.bubble,
                  isBot ? styles.bubbleBot : styles.bubbleUser,
                ]}
              >
                <Text style={styles.messageText}>{msg.texto}</Text>
              </View>
              {msg.hora && (
                <Text
                  style={[
                    styles.timestamp,
                    isBot ? styles.timestampBot : styles.timestampUser,
                  ]}
                >
                  {typeof msg.hora === "string"
                      ? msg.hora.includes("T")
                          ? msg.hora.split("T")[1].substring(0, 5)
                          : msg.hora.substring(0, 5)
                      : msg.hora}
                </Text>
              )}
            </View>
          );
        })}

        {isLoadingIA && (
          <View style={styles.messageWrapper}>
            <View style={[styles.bubble, styles.bubbleLoading]}>
              <ActivityIndicator size="small" color="#1117B1" />
              <Text style={styles.loadingText}>{t("chat.ia_digitando")}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={t("chat.digite_pergunta")}
            placeholderTextColor="#666"
            value={textoAtual}
            onChangeText={setTextoAtual}
            onSubmitEditing={() => enviarMensagem(textoAtual)}
            returnKeyType="send"
          />
          <View style={styles.divider} />
          <Pressable
            style={styles.iconButton}
            onPress={() => enviarMensagem(textoAtual)}
          >
            <Ionicons
              name="send"
              size={18}
              color="#FFF"
              style={{ marginLeft: 3 }}
            />
          </Pressable>
        </View>
      </View>

      <Modal
        visible={modalMenuChatVisivel}
        transparent={true}
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalMenuChatVisivel(false)}
        >
          <View style={styles.modalMenuContent}>
            <Text style={styles.modalMenuTitle}>{t("chat.opcoes_conversa")}</Text>

            <TouchableOpacity
              style={styles.modalMenuItem}
              onPress={confirmarApagarMensagens}
            >
              <Ionicons name="trash-outline" size={20} color="#D9534F" />
              <Text style={[styles.modalMenuItemText, { color: "#D9534F" }]}>
                {t("chat.limpar_mensagens")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalMenuItem,
                { borderBottomWidth: 0, justifyContent: "center" },
              ]}
              onPress={() => setModalMenuChatVisivel(false)}
            >
              <Text style={{ color: "#888", fontWeight: "bold" }}>
                {t("chat.cancelar")}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {renderModalAlerta()}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },
  listHeaderContainer: {
    padding: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  novoChatBtnBig: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1117B1",
    paddingVertical: 12,
    borderRadius: 8,
  },
  novoChatTextBig: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  fullListContainer: {
    flex: 1,
    padding: 15,
  },
  chatListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chatListInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chatListTextContainer: {
    marginLeft: 12,
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  chatListTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    flexShrink: 1,
    marginRight: 8,
  },
  chatListPinnedText: {
    fontSize: 11,
    color: "#1117B1",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  chatListSubtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtnText: {
    color: "#1117B1",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  optionsBtn: {
    padding: 8,
  },
  emptyStateText: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
    fontStyle: "italic",
    fontSize: 16,
  },
  sugestoesContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 5,
  },
  sugestoesLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 8,
    marginRight: 8,
  },
  chipsWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  chip: {
    backgroundColor: "#1117B1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 6,
  },
  chipText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    paddingTop: 10,
  },
  messageWrapper: {
    marginBottom: 10,
  },
  bubble: {
    padding: 15,
    borderRadius: 18,
    maxWidth: "80%",
  },
  bubbleBot: {
    backgroundColor: "#E4E9F7",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#BFC3ED",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  bubbleLoading: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E4E9F7",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    marginLeft: 8,
    color: "#1117B1",
    fontStyle: "italic",
    fontSize: 13,
  },
  messageText: {
    fontSize: 15,
    color: "#111",
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  timestampBot: {
    alignSelf: "flex-start",
    marginLeft: 4,
  },
  timestampUser: {
    alignSelf: "flex-end",
    marginRight: 4,
  },
  inputSection: {
    paddingHorizontal: 15,
    paddingBottom: 25,
    paddingTop: 10,
    backgroundColor: "#F4F4F6",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconButton: {
    backgroundColor: "#1117B1",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 15,
    color: "#333",
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: "#DDD",
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMenuContent: {
    backgroundColor: "#FFF",
    width: 250,
    borderRadius: 15,
    paddingVertical: 10,
  },
  modalMenuTitle: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
    color: "#111",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  modalMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F6",
  },
  modalMenuItemText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 15,
  },
  modalEditContent: {
    backgroundColor: "#FFF",
    width: "80%",
    borderRadius: 15,
    padding: 20,
  },
  modalEditTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 15,
    textAlign: "center",
  },
  modalEditInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#FAFAFA",
  },
  modalEditButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalEditBtnCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#EEE",
    marginRight: 10,
    alignItems: "center",
  },
  modalEditBtnCancelText: {
    color: "#555",
    fontWeight: "bold",
  },
  modalEditBtnSave: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#1117B1",
    alignItems: "center",
  },
  modalEditBtnSaveText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalAlertContent: {
    backgroundColor: "#FFF",
    width: "80%",
    maxWidth: 350,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalAlertTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 10,
    textAlign: "center",
  },
  modalAlertMessage: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  modalAlertButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalAlertBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalAlertBtnCancel: {
    backgroundColor: "#EEE",
  },
  modalAlertBtnDestructive: {
    backgroundColor: "#D9534F",
  },
  modalAlertBtnDefault: {
    backgroundColor: "#1117B1",
  },
  modalAlertBtnText: {
    fontWeight: "bold",
    fontSize: 15,
  },
  modalAlertBtnTextCancel: {
    color: "#555",
  },
  modalAlertBtnTextDestructive: {
    color: "#FFF",
  },
  modalAlertBtnTextDefault: {
    color: "#FFF",
  },
  selectionActionBar: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    justifyContent: "space-between",
  },
  btnCancelarSelecao: {
    flex: 1,
    padding: 12,
    backgroundColor: "#EEE",
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  btnExcluirSelecao: {
    flex: 2,
    padding: 12,
    backgroundColor: "#D9534F",
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextCancelar: { 
    color: "#555", 
    fontWeight: "bold" 
  },
  btnTextExcluir: { 
    color: "#FFF", 
    fontWeight: "bold" 
  },
});