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
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

export default function CadastroProduto() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const router = useRouter();
  const produtoId = params.id;

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [setores, setSetores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [imagemSelecionada, setImagemSelecionada] = useState(null);

  const [produto, setProduto] = useState({
    codigo: params.codigo || "",
    nome: params.nome || "",
    quantidade: params.quantidade || "",
    setor: params.setorId
      ? { id: params.setorId, nome: params.setorNome }
      : null,
    categoria: params.categoriaId
      ? { id: params.categoriaId, nome: params.categoriaNome }
      : null,
    valorCompra: params.valorCompra
      ? Number(params.valorCompra).toFixed(2)
      : "0.00",
    valorUnitario: params.valorUnitario
      ? Number(params.valorUnitario).toFixed(2)
      : "0.00",
    quantidadeMin: params.quantidadeMin || "",
    quantidadeMax: params.quantidadeMax || "",
    descricao: params.descricao || "",
  });

  useEffect(() => {
    global.setHeaderTitulo(produtoId ? t("estoque.form.editar_produto") : t("estoque.form.novo_produto"));
    global.setHeaderSubTitulo(
      produtoId
        ? t("estoque.form.editando", { nome: params.nome })
        : t("estoque.form.preencha_campos")
    );
  }, [produtoId, params.nome, t]);

  useEffect(() => {
    async function carregarDados() {
      const user = await buscarUsuario();
      const tkn = await recuperarToken();
      setUsuario(user);
      setToken(tkn);

      if (user && tkn) {
        api
          .get(`${ENDPOINTS.SETORES}/${user.userId}`, {
            headers: { Authorization: `Bearer ${tkn}` },
          })
          .then((res) => setSetores(res.data));
        api
          .get(`${ENDPOINTS.CATEGORIAS}/${user.userId}`, {
            headers: { Authorization: `Bearer ${tkn}` },
          })
          .then((res) => setCategorias(res.data));
      }
    }
    carregarDados();
  }, []);

  const formatarMoedaExibicao = (valor) => {
    const numero = parseFloat(valor || 0);
    return (
      numero
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    );
  };

  const handleMudarValor = (campo, texto) => {
    const apenasNumeros = String(texto).replace(/\D/g, "");
    const valorDecimal = (parseInt(apenasNumeros || "0", 10) / 100).toFixed(2);
    setProduto({ ...produto, [campo]: valorDecimal });
  };

  const handleSalvar = async () => {
    try {
      if (!usuario || !token) {
        alert(t("estoque.form.sessao_expirada"));
        return;
      }

       const validarCampos = () => {
        if (
          !produto.codigo ||
          !produto.nome ||
          !produto.quantidade ||
          !produto.categoria ||
          !produto.setor
        ) {
          toast.error(t("estoque.form.campos_obrigatorios"));
          return false;
        }
        if (
          isNaN(produto.quantidade) ||
          produto.quantidade < 0 ||
          isNaN(produto.quantidadeMin) ||
          produto.quantidadeMin < 0 ||
          isNaN(produto.quantidadeMax) ||
          produto.quantidadeMax < 0
        ) {
          toast.error(t("estoque.form.qtd_positiva"));
          return false;
        }

        if (
          produto.quantidadeMin !== "" &&
          produto.quantidadeMax !== "" &&
          Number(produto.quantidadeMax) <= Number(produto.quantidadeMin)
        ) {
          toast.error(t("estoque.form.qtd_max_min"));
          return false;
        }
        const valorCompra = parseFloat(
          String(produto.valorCompra).replace(/\./g, "").replace(",", ".")
        );
        const valorUnitario = parseFloat(
          String(produto.valorUnitario).replace(/\./g, "").replace(",", ".")
        );
        if (
          !isNaN(valorCompra) &&
          !isNaN(valorUnitario) &&
          valorUnitario <= valorCompra
        ) {
          toast.error(t("estoque.form.valor_unitario_compra"));
          return false;
        }
        return true;
      };

      if (!validarCampos()) return;

      const idCategoria = produto.categoria?.id || produto.categoria;
      const idSetor = produto.setor?.id || produto.setor;

      const dados = {
        codigo: parseInt(produto.codigo),
        nome: produto.nome,
        quantidade: parseInt(produto.quantidade),
        valorCompra: parseFloat(produto.valorCompra),
        valorUnitario: parseFloat(produto.valorUnitario),
        quantidadeMin: parseInt(produto.quantidadeMin),
        quantidadeMax: parseInt(produto.quantidadeMax),
        descricao: produto.descricao,
        dataRegistro: new Date().toISOString().split("T")[0],
        categoria: idCategoria ? { id: idCategoria } : null,
        setor: idSetor ? { id: idSetor } : null,
        funcionario: { id: usuario.userId },
      };

      const formData = new FormData();
      const requestBlob = new Blob([JSON.stringify(dados)], {
        type: "application/json",
      });

      formData.append(
        produtoId ? "produtoParaEditar" : "produtoParaCadastrar",
        requestBlob,
        "request.json",
      );

      if (imagemSelecionada && imagemSelecionada.uri) {
        const uri = imagemSelecionada.uri;
        const fileName = uri.split("/").pop() || "imagem.jpg";
        const match = /\.(\w+)$/.exec(fileName);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("imagem", {
          uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
          name: fileName,
          type: type,
        });
      }

      const url = produtoId
        ? `${ENDPOINTS.PRODUTOS}/${produtoId}/${usuario.userId}`
        : `${ENDPOINTS.PRODUTOS}/${usuario.userId}`;

      await executarComToast(
        () =>
          (produtoId ? api.patch : api.post)(url, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }),
        {
          loadingMsg: produtoId ? t("estoque.form.msg_editando", { nome: produto.nome }) : t("estoque.form.msg_cadastrando", { nome: produto.nome }),
          successMsg: produtoId ? t("estoque.form.sucesso_editado", { nome: produto.nome }) : t("estoque.form.sucesso_cadastrado", { nome: produto.nome }),
          errorMsg: produtoId ? t("estoque.form.erro_editar", { nome: produto.nome }) : t("estoque.form.erro_cadastrar", { nome: produto.nome }),
          onSuccess: () => {
            router.push("/estoque");
          },
        }
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
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
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <CampoImagem
              label={t("estoque.form.foto_produto")}
              imagemUri={imagemSelecionada?.uri}
              onImageSelected={setImagemSelecionada}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.codigo")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("estoque.form.ex_codigo")}
              keyboardType="numeric"
              value={String(produto.codigo)}
              onChangeText={(t) => setProduto({ ...produto, codigo: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.quantidade")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("estoque.form.ex_quantidade")}
              keyboardType="numeric"
              value={String(produto.quantidade)}
              onChangeText={(t) => setProduto({ ...produto, quantidade: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.nome")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("estoque.form.ex_nome")}
              value={produto.nome}
              onChangeText={(t) => setProduto({ ...produto, nome: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.descricao")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t("estoque.form.ex_descricao")}
              multiline
              value={produto.descricao}
              onChangeText={(t) => setProduto({ ...produto, descricao: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.valor_compra")}</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={formatarMoedaExibicao(produto.valorCompra)}
              onChangeText={(t) => handleMudarValor("valorCompra", t)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.valor_venda")}</Text>
            <TextInput
              style={styles.input}
              placeholder="0,00"
              keyboardType="numeric"
              value={formatarMoedaExibicao(produto.valorUnitario)}
              onChangeText={(t) => handleMudarValor("valorUnitario", t)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.qtd_minima")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("estoque.form.ex_qtd_minima")}
              keyboardType="numeric"
              value={String(produto.quantidadeMin)}
              onChangeText={(t) => setProduto({ ...produto, quantidadeMin: t })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("estoque.form.qtd_maxima")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("estoque.form.ex_qtd_maxima")}
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
            onPress={handleSalvar}
          >
            <Text style={styles.btnTextSalvar}>
              {produtoId ? t("estoque.form.btn_editar") : t("estoque.form.btn_cadastrar")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnCancelar}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <Text style={styles.btnTextCancelar}>{t("estoque.form.cancelar")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F2" },
  container: { padding: 16, paddingBottom: 40 },
  formularioCard: { backgroundColor: "#FFFFFF", borderRadius: 8, padding: 20, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: "visible" },
  inputGroup: { marginBottom: 20, width: "100%" },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  inputGroupWrap: { width: width < 500 ? "100%" : "48%", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", color: "#000000", marginBottom: 8 },
  required: { color: "red" },
  input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#DDE2E5", borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: "#333" },
  textArea: { height: 100, textAlignVertical: "top" },
  botoesContainer: { flexDirection: "row", gap: 12, marginTop: 10 },
  btnSalvar: { flex: 1, backgroundColor: "#1E22AA", padding: 15, borderRadius: 8, alignItems: "center" },
  btnTextSalvar: { color: "#FFF", fontWeight: "700", fontSize: 16 },
  btnCancelar: { flex: 1, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#000", padding: 15, borderRadius: 8, alignItems: "center" },
  btnTextCancelar: { color: "#000", fontWeight: "700", fontSize: 16 },
});