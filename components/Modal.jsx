import { View, Text, StyleSheet, Modal as RNModal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function Modal(props) {
  const { t } = useTranslation();

  return (
    <RNModal transparent={true} visible={true} animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.titulo}>
              {props.titulo || t("componentes.modal.titulo_modal")}
            </Text>
            <Pressable onPress={props.onClose} style={styles.botaoFechar}>
              <Ionicons name="close" size={24} color="#333" />
            </Pressable>
          </View>
          <View style={styles.corpo}>
            {props.children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modal: { backgroundColor: 'white', padding: 20, width: '100%', minHeight: '55%', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  titulo: { fontSize: 21, fontWeight: 'bold', textAlign: 'center' },
  botaoFechar: { position: "absolute", right: 0, top: 0, padding: 5 },
  corpo: { flex: 1, width: '100%' }
});