import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState, useRef } from "react";
import api_ia from "../../../provider/api_ia";
import { recuperarToken } from "../../../utils/storage";

const sugestoes = [
  "Qual produto mais vendeu hoje?",
  "Vendas da semana",
  "Qual foi o faturamento da semana?",
  "Quantas vendas tivemos ontem?",
];

export default function Chat() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    recuperarToken().then((t) => setToken(t));
  }, [])
  const [mensagens, setMensagens] = useState([
    {
      id: "1",
      tipo: "bot",
      texto:
        "Olá! Posso ajudar você com informações sobre vendas de produtos",
      hora: obterHoraAtual(),
    },
  ]);
  const [textoAtual, setTextoAtual] = useState("");
  const scrollViewRef = useRef();

  useEffect(() => {
    global.setHeaderTitulo("Chatbot I9Tech");
    global.setHeaderSubTitulo("Assistente inteligente de vendas");
  }, []);

  function obterHoraAtual() {
    const data = new Date();
    const horas = data.getHours().toString().padStart(2, "0");
    const minutos = data.getMinutes().toString().padStart(2, "0");
    return `${horas}:${minutos}`;
  }

  function enviarMensagem(texto) {
    if (!texto.trim()) return;

    const novaMensagemUsuario = {
      id: Date.now().toString(),
      tipo: "user",
      texto: texto.trim(),
      hora: obterHoraAtual(),
    };

    setMensagens((prev) => [...prev, novaMensagemUsuario]);
    setTextoAtual("");
    enviarMensagemIA(novaMensagemUsuario.texto);

    // setTimeout(() => {
    //   const mensagemBot = {
    //     id: (Date.now() + 1).toString(),
    //     tipo: "bot",
    //     texto:
    //       "Olá, obrigado pela mensagem! O chat ainda está em desenvolvimento, tente novamente mais tarde!",
    //     hora: obterHoraAtual(),
    //   };
    //   setMensagens((prev) => [...prev, mensagemBot]);
    // }, 800);
  }

  const enviarMensagemIA = async (texto) => {
    // Aqui você pode integrar com a API do ChatGPT ou outro serviço de IA
    try {

      const response = await api_ia.post("/api/chat", {
        id_usuario: "1",
        pergunta: texto,
        token: token,
      });

      const mensagemBot = {
        id: (Date.now() + 1).toString(),
        tipo: "bot",
        texto: response.data.resposta,
        hora: obterHoraAtual(),
      };
      setMensagens((prev) => [...prev, mensagemBot]);
    } catch (err) {
      console.log("Erro: ", err);
      const mensagemBot = {
        id: (Date.now() + 1).toString(),
        tipo: "bot",
        texto:
          "Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente.",
        hora: obterHoraAtual(),
      };
      setMensagens((prev) => [...prev, mensagemBot]);
    }
  };

  function limparHistorico() {
    setMensagens([
      {
        id: Date.now().toString(),
        tipo: "bot",
        texto: "Histórico limpo. Como posso ajudar agora?",
        hora: obterHoraAtual(),
      },
    ]);
  }

  return (
    <KeyboardAvoidingView
      style={styles.safe}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.sugestoesContainer}>
        <Text style={styles.sugestoesLabel}>Sugestões:</Text>
        <View style={styles.chipsWrapper}>
          {sugestoes.map((item, index) => (
            <Pressable
              key={index}
              style={styles.chip}
              onPress={() => enviarMensagem(item)}
            >
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>
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
              <Text
                style={[
                  styles.timestamp,
                  isBot ? styles.timestampBot : styles.timestampUser,
                ]}
              >
                {msg.hora}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <Pressable style={styles.iconButton} onPress={limparHistorico}>
            <Ionicons name="trash-outline" size={20} color="#FFF" />
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Digite a sua pergunta...."
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F6",
  },
  sugestoesContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 10,
  },
  sugestoesLabel: {
    fontSize: 12,
    color: "#555",
    marginTop: 8,
    marginRight: 8,
  },
  chipsWrapper: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "#1117B1",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 6,
    marginBottom: 6,
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
});
