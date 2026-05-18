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
import { useTranslation } from 'react-i18next';

export default function Ajuda() {
  const [expandedId, setExpandedId] = useState(null);
  const { t } = useTranslation();

  const faqData = t('ajuda.faq', { returnObjects: true }) || [];

  useEffect(() => {
    global.setHeaderTitulo(t('ajuda.header_titulo'));
    global.setHeaderSubTitulo(t('ajuda.header_subtitulo'));
  }, [t]);

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
        {t('ajuda.perguntas_frequentes')}
      </Text>
      <Text style={styles.introText}>
        {t('ajuda.intro_text')}
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
          {t('ajuda.cta_titulo')}
        </Text>
        <Text style={styles.ctaSubtitulo}>
          {t('ajuda.cta_subtitulo')}
        </Text>
      </View>

      <View>
        <Text style={styles.textoBotaoSuporte}>
          inove9technology@gmail.com
        </Text>
      </View>

    </ScrollView>
  )
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
    // color: "#FFFFFF",
    color: "#0F14B8",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    // textDecorationLine: "underline",
  },
});