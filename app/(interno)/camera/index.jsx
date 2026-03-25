import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import Modal from "../../../components/Modal";

export default function Camera() {
  const [permissao, solicitarPermissao] = useCameraPermissions();
  const [escaneado, setEscaneado] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(true);

  useEffect(() => {
    global.setHeaderTitulo("Câmera");
    global.setHeaderSubTitulo("Escaneie a nota fiscal para adicionar os produtos");
  }, []);

  if (!permissao) {
    return <View style={styles.safe} />;
  }

  if (!permissao.granted && modalVisivel) {
    return (
      <Modal titulo="Permissão Necessária">
          <View style={styles.modalContent}>
            <Text style={styles.textoPermissaoModal}>
              Precisamos da sua permissão para acessar a câmera do dispositivo e ler as notas fiscais pelo aplicativo.
            </Text>
            
            <Pressable style={styles.botaoPrincipal} onPress={() => {
              solicitarPermissao();
              setModalVisivel(false);
            }}>
              <Text style={styles.textoBotaoPrincipal}>Conceder Permissão</Text>
            </Pressable>
          </View>
        </Modal>
    );
  }

  const aoEscanearCodigo = ({ type, data }) => {
    setEscaneado(true);
    Alert.alert(
      "Leitura Concluída",
      `Dados da Nota: ${data}`,
      [
        {
          text: "Escanear Novamente",
          onPress: () => setEscaneado(false),
        },
      ]
    );
  };

  return (
    <View style={styles.safe}>
      
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="camera" size={22} color="#111" />
          <Text style={styles.titulo}>Ler nota fiscal</Text>
        </View>

        <Text style={styles.subtitulo}>
          Aponte a câmera para a nota fiscal. O sistema irá identificar automaticamente os produtos
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr"], 
          }}
          onBarcodeScanned={escaneado ? undefined : aoEscanearCodigo}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F4F6",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    marginBottom: 25,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginLeft: 10,
  },
  subtitulo: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    fontWeight: "500",
  },
  cameraContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 30,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: "#EBEBEB", 
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalContent: {
    paddingVertical: 10,
    alignItems: "center",
  },
  textoPermissaoModal: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 25,
  },
  botaoPrincipal: {
    backgroundColor: "#0F14B8", 
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  textoBotaoPrincipal: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});