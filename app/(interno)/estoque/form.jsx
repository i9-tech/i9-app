import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DropdownInterativo from "../../../components/Dropdown";
import api from "../../../provider/api";
import { ENDPOINTS } from "../../../utils/endpoints";
import { buscarUsuario, recuperarToken } from "../../../utils/storage";
import CampoImagem from "../../../components/CampoImagem";

const { width } = Dimensions.get("window");

export default function CadastroProduto() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const produtoId = params.id;

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [setores, setSetores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  // Estado inicial tratando os valores que vem da URL
  const [produto, setProduto] = useState({
    codigo: params.codigo || "",
    nome: params.nome || "",
    quantidade: params.quantidade || "",
    setor: params.setorId ? { id: params.setorId, nome: params.setorNome } : null,
    categoria: params.categoriaId ? { id: params.categoriaId, nome: params.categoriaNome } : null,
    valorCompra: params.valorCompra ? Number(params.valorCompra).toFixed(2) : "0.00",
    valorUnitario: params.valorUnitario ? Number(params.valorUnitario).toFixed(2) : "0.00",
    quantidadeMin: params.quantidadeMin || "",
    quantidadeMax: params.quantidadeMax || "",
    descricao: params.descricao || "",
  });

  useEffect(() => {
    global.setHeaderTitulo(produtoId ? "Editar Produto" : "Novo Produto");
    global.setHeaderSubTitulo(
      produtoId ? `Editando: ${params.nome}` : "Preencha os campos para cadastrar"
    );
  }, [produtoId, params.nome]);

  useEffect(() => {
    async function carregarDados() {
      const user = await buscarUsuario();
      const tkn = await recuperarToken();
      setUsuario(user);
      setToken(tkn);

      if (user && tkn) {
        api.get(`${ENDPOINTS.SETORES}/${user.userId}`, { headers: { Authorization: `Bearer ${tkn}` } })
          .then(res => setSetores(res.data));
        api.get(`${ENDPOINTS.CATEGORIAS}/${user.userId}`, { headers: { Authorization: `Bearer ${tkn}` } })
          .then(res => setCategorias(res.data));
      }
    }
    carregarDados();
  }, []);

  const formatarMoedaExibicao = (valor) => {
    const numero = parseFloat(valor || 0);
    return "R$ " + numero.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleMudarValor = (campo, texto) => {
    const apenasNumeros = String(texto).replace(/\D/g, "");
    const valorDecimal = (parseInt(apenasNumeros || "0", 10) / 100).toFixed(2);
    setProduto({ ...produto, [campo]: valorDecimal });
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formularioCard}>

          {/* IMAGEM */}
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <CampoImagem
              label="Foto do Produto"
              imagemUri={imagemSelecionada?.uri}
              onImageSelected={setImagemSelecionada}
            />
          </View>

          {/* CÓDIGO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código do Produto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 1009"
              keyboardType="numeric"
              value={String(produto.codigo)}
              onChangeText={(t) => setProduto({ ...produto, codigo: t })}
            />
          </View>

          {/* QUANTIDADE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 80"
              keyboardType="numeric"
              value={String(produto.quantidade)}
              onChangeText={(t) => setProduto({ ...produto, quantidade: t })}
            />
          </View>

          {/* NOME */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Esfiha de carne"
              value={produto.nome}
              onChangeText={(t) => setProduto({ ...produto, nome: t })}
            />
          </View>

          {/* DESCRIÇÃO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ex: Esfihas de carne temperadas"
              multiline
              value={produto.descricao}
              onChangeText={(t) => setProduto({ ...produto, descricao: t })}
            />
          </View>

          {/* VALOR COMPRA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor Compra *</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              keyboardType="numeric"
              value={formatarMoedaExibicao(produto.valorCompra)}
              onChangeText={(t) => handleMudarValor("valorCompra", t)}
            />
          </View>

          {/* VALOR VENDA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor Venda *</Text>
            <TextInput
              style={styles.input}
              placeholder="R$ 0,00"
              keyboardType="numeric"
              value={formatarMoedaExibicao(produto.valorUnitario)}
              onChangeText={(t) => handleMudarValor("valorUnitario", t)}
            />
          </View>

          {/* QTD MIN */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qtd Mínima *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 10"
              keyboardType="numeric"
              value={String(produto.quantidadeMin)}
              onChangeText={(t) => setProduto({ ...produto, quantidadeMin: t })}
            />
          </View>

          {/* QTD MAX */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qtd Máxima *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              keyboardType="numeric"
              value={String(produto.quantidadeMax)}
              onChangeText={(t) => setProduto({ ...produto, quantidadeMax: t })}
            />
          </View>



        </View>

        <View style={styles.botoesContainer}>
          <TouchableOpacity
            style={styles.btnSalvar}
            activeOpacity={0.8}
            onPress={() => console.log("Salvar produto:", produto)}
          >
            <Text style={styles.btnTextSalvar}>
              {produtoId ? "Editar" : "Cadastrar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancelar}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.btnTextCancelar}>Cancelar</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  container: {
    padding: 16,
    paddingBottom: 40
  },
  formularioCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: "visible",
  },
  inputGroup: {
    marginBottom: 20,
    width: "100%"
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  inputGroupWrap: {
    width: width < 500 ? "100%" : "48%",
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8
  },
  required: {
    color: "red"
  },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDE2E5",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top"
  },
  botoesContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: "#1E22AA",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextSalvar: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextCancelar: {
    color: "#000",
    fontWeight: "700",
    fontSize: 16
  },
});
