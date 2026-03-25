import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";

const faqData = [
  {
    id: '1',
    question: 'Como cadastrar um produto?',
    answer: 'Para cadastrar um novo produto:\n1. Vá até a aba "Produtos".\n2. Clique no botão "+" no canto inferior.\n3. Preencha os campos obrigatórios (nome, preço, etc.).\n4. Toque em "Salvar".',
  },
  {
    id: '2',
    question: 'Como escanear o produto?',
    answer: 'Utilize a câmera do seu dispositivo:\n1. Na tela de venda, toque no ícone de código de barras.\n2. Aponte a câmera para o código de barras do produto.\n3. O sistema fará a leitura automaticamente.',
  },
  {
    id: '3',
    question: 'Como ver as vendas?',
    answer: 'Para visualizar suas vendas:\n1. Vá até a tela inicial (Dashboard).\n2. Veja o card "Vendas do dia".\n3. Confira também o gráfico de desempenho de vendas da semana.\nEssas informações ajudam a acompanhar o desempenho do seu negócio.',
  },
  {
    id: '4',
    question: 'Como ver o lucro?',
    answer: 'O lucro detalhado pode ser acessado em relatórios:\n1. Acesse o menu lateral.\n2. Toque em "Relatórios".\n3. Selecione "DRE Simplificado" ou "Relatório de Lucratividade".\n4. Filtre pelo período desejado.',
  },
];

export default function Ajuda() {
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    global.setHeaderTitulo("Ajuda");
    global.setHeaderSubTitulo("Contato com suporte i9Tech");
  }, []);

  const toggleItem = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.containerStyle}>
      <Text style={styles.titulo}>
        Perguntas Frequentes
      </Text>
      <Text style={styles.introText}>
        Encontre respostas ou fale com o suporte
      </Text>


      <View style={styles.faqListContainer}>
        {faqData.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <View key={item.id} style={styles.faqItemContainer}>
              <Pressable onPress={() => toggleItem(item.id)}>
                <View style={[
                  styles.faqHeader, 
                  isExpanded && styles.faqHeaderExpanded
                ]}>
                  <Text style={styles.faqQuestion}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={22}
                    color="#333333"
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.faqContent}>
                  <Text style={styles.faqAnswer}>
                    {item.answer}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.ctaContainer}>
        <Text style={styles.ctaTitulo}>
          Ficou com alguma dúvida?
        </Text>
        <Text style={styles.ctaSubtitulo}>
          Se ainda não tivermos respondido sua pergunta, você pode entrar em contato com o nosso suporte técnico e abrir um chamado com a nossa equipe.
        </Text>
      </View>

      <Pressable
        style={styles.botaoSuporte}
        onPress={() => Alert.alert("Suporte", "Sua solicitação está sendo encaminhada para a nossa equipe.")}
      >
        <Text style={styles.textoBotaoSuporte}>
          Abrir chamado
        </Text>
      </Pressable>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  containerStyle: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  introText: {
    fontSize: 18,
    color: "#555555",
    textAlign: "center",
    marginBottom: 40,
    width: "80%",
  },
  titulo: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginBottom: 10,
  },
  faqListContainer: {
    width: "100%",
    marginBottom: 40,
  },
  faqItemContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  faqHeaderExpanded: {
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
    flex: 1,
    marginRight: 10,
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 22,
  },
  ctaContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  ctaTitulo: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111111",
    textAlign: "center",
    marginBottom: 15,
  },
  ctaSubtitulo: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
    width: "90%",
  },
  botaoSuporte: {
    backgroundColor: "#0F14B8",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  textoBotaoSuporte: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});