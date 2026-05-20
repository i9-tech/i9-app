import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Modal as RNModal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CORES = {
  primaria: "#0F14B8",
  primariaSuave: "#E8E9FF",
  fundo: "#F4F4F6",
  branco: "#FFFFFF",
  texto: "#111111",
  textoSuave: "#666666",
  borda: "#E0E0E0",
  sucesso: "#16A34A",
  sucessoSuave: "#DCFCE7",
  erro: "#DC2626",
  aviso: "#D97706",
  avisoSuave: "#FEF3C7",
  duplicata: "#7C3AED",
  duplicataSuave: "#EDE9FE",
};

function Dropdown({ placeholder, opcoes, valorSelecionado, aoSelecionar, rotulo }) {
  const [aberto, setAberto] = React.useState(false);
  const labelSelecionado = opcoes.find((o) => o.id === valorSelecionado)?.nome;

  return (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.campo}>{rotulo}</Text>
      <Pressable
        style={[styles.dropdownBotao, aberto && styles.dropdownBotaoAberto]}
        onPress={() => setAberto((v) => !v)}
      >
        <Text style={labelSelecionado ? styles.dropdownTexto : styles.dropdownPlaceholder}>
          {labelSelecionado ?? placeholder}
        </Text>
        <Ionicons name={aberto ? "chevron-up" : "chevron-down"} size={16} color={CORES.textoSuave} />
      </Pressable>

      {aberto && (
        <View style={styles.dropdownLista}>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => { aoSelecionar(null); setAberto(false); }}
          >
            <Text style={styles.dropdownItemTextoVazio}>Nenhum</Text>
          </Pressable>
          {opcoes.map((opcao) => (
            <Pressable
              key={opcao.id}
              style={[styles.dropdownItem, opcao.id === valorSelecionado && styles.dropdownItemAtivo]}
              onPress={() => { aoSelecionar(opcao.id); setAberto(false); }}
            >
              <Text style={[styles.dropdownItemTexto, opcao.id === valorSelecionado && styles.dropdownItemTextoAtivo]}>
                {opcao.nome}
              </Text>
              {opcao.id === valorSelecionado && (
                <Ionicons name="checkmark" size={16} color={CORES.primaria} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ProdutoCard({ produto, indice, total, onChange, setores, categorias }) {
  const atualizar = (campo, valor) => onChange(indice, campo, valor);
  const ehDuplicata = produto.duplicata === true;

  return (
    <View style={[styles.card, ehDuplicata && styles.cardDuplicata]}>
      <View style={styles.cardCabecalho}>
        <View style={[styles.cardBadge, ehDuplicata && styles.cardBadgeDuplicata]}>
          <Text style={[styles.cardBadgeTexto, ehDuplicata && styles.cardBadgeTextoDuplicata]}>
            {indice + 1} / {total}
          </Text>
        </View>
        <Text style={styles.cardNome} numberOfLines={2}>
          {produto.nome || "Produto sem nome"}
        </Text>
      </View>

      {ehDuplicata && (
        <View style={styles.duplicataBox}>
          <Ionicons name="sync-outline" size={16} color={CORES.duplicata} />
          <Text style={styles.duplicataTexto}>
            Produto já cadastrado. A quantidade será somada ao estoque existente.
          </Text>
        </View>
      )}

      <View style={styles.linhaGrid}>
        <View style={[styles.campoBox, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.campo}>Quantidade importada</Text>
          <View style={styles.valorSomenteLeitura}>
            <Text style={styles.valorTexto}>{produto.quantidade ?? "—"}</Text>
          </View>
        </View>
        <View style={[styles.campoBox, { flex: 1 }]}>
          <Text style={styles.campo}>Preço de compra</Text>
          <View style={styles.valorSomenteLeitura}>
            <Text style={styles.valorTexto}>
              {produto.valor_compra != null
                ? `R$ ${Number(produto.valor_compra).toFixed(2)}`
                : "—"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.campoBox}>
        <Text style={styles.campo}>
          Preço de venda <Text style={{ color: CORES.erro }}>*</Text>
        </Text>
        <View style={styles.inputComIcone}>
          <Text style={styles.inputPrefixo}>R$</Text>
          <TextInput
            style={styles.inputInterno}
            placeholder="0,00"
            placeholderTextColor={CORES.textoSuave}
            keyboardType="numeric"
            value={produto.preco_venda}
            onChangeText={(v) => atualizar("preco_venda", v)}
          />
        </View>
      </View>

      {!ehDuplicata && (
        <View style={styles.linhaGrid}>
          <View style={[styles.campoBox, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.campo}>Estoque mínimo</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(produto.quantidade_min ?? 10)}
              onChangeText={(v) => atualizar("quantidade_min", parseInt(v) || 0)}
            />
          </View>
          <View style={[styles.campoBox, { flex: 1 }]}>
            <Text style={styles.campo}>Estoque máximo</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(produto.quantidade_max ?? 100)}
              onChangeText={(v) => atualizar("quantidade_max", parseInt(v) || 0)}
            />
          </View>
        </View>
      )}

      <Dropdown
        rotulo="Setor"
        placeholder="Automático (primeiro disponível)"
        opcoes={setores}
        valorSelecionado={produto.setor_id}
        aoSelecionar={(v) => atualizar("setor_id", v)}
      />
      <Dropdown
        rotulo="Categoria"
        placeholder="Automática (primeira disponível)"
        opcoes={categorias}
        valorSelecionado={produto.categoria_id}
        aoSelecionar={(v) => atualizar("categoria_id", v)}
      />
    </View>
  );
}

export default function ModalRevisaoETL({
  visivel,
  onFechar,
  erroVisivel,
  onFecharErro,
  produtos,
  onAtualizarProduto,
  setores,
  categorias,
  carregando,
  salvando,
  onConfirmar,
}) {
  const qtdDuplicatas = produtos.filter((p) => p.duplicata).length;
  const qtdNovos = produtos.length - qtdDuplicatas;

  return (
    <>
      <RNModal
        visible={visivel}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onFechar}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitulo}>Revisar produtos</Text>
              <View style={styles.modalContadores}>
                {qtdNovos > 0 && (
                  <View style={styles.contadorBadge}>
                    <Ionicons name="add-circle-outline" size={13} color={CORES.sucesso} />
                    <Text style={[styles.contadorTexto, { color: CORES.sucesso }]}>
                      {qtdNovos} novo(s)
                    </Text>
                  </View>
                )}
                {qtdDuplicatas > 0 && (
                  <View style={[styles.contadorBadge, { backgroundColor: CORES.duplicataSuave }]}>
                    <Ionicons name="sync-outline" size={13} color={CORES.duplicata} />
                    <Text style={[styles.contadorTexto, { color: CORES.duplicata }]}>
                      {qtdDuplicatas} já existente(s)
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable style={styles.modalFechar} onPress={onFechar}>
              <Ionicons name="close" size={22} color={CORES.texto} />
            </Pressable>
          </View>

          <View style={styles.avisoBox}>
            <Ionicons name="information-circle-outline" size={16} color={CORES.aviso} />
            <Text style={styles.avisoTexto}>
              Preencha: preço de venda, setor e categoria. Caso deixe em branco, serão atribuídos automaticamente.
            </Text>
          </View>

          {carregando ? (
            <View style={styles.centrado}>
              <ActivityIndicator size="large" color={CORES.primaria} />
              <Text style={styles.carregandoTexto}>Verificando produtos...</Text>
            </View>
          ) : (
            <FlatList
              data={produtos}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.listaConteudo}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <ProdutoCard
                  produto={item}
                  indice={index}
                  total={produtos.length}
                  onChange={onAtualizarProduto}
                  setores={setores}
                  categorias={categorias}
                />
              )}
            />
          )}

          <View style={styles.modalRodape}>
            <Pressable
              style={[styles.botaoPrimario, salvando && styles.botaoDesabilitado]}
              onPress={onConfirmar}
              disabled={salvando}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={[styles.botaoPrimarioTexto, { marginLeft: 8 }]}>
                    Confirmar {produtos.length} produto(s)
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </RNModal>

      <RNModal
        visible={erroVisivel}
        animationType="fade"
        transparent
        onRequestClose={onFecharErro}
      >
        <View style={styles.modalErroOverlay}>
          <View style={styles.modalErroBox}>
            <Ionicons name="warning-outline" size={48} color={CORES.erro} />
            <Text style={styles.modalErroTitulo}>Erro na leitura</Text>
            <Text style={styles.modalErroTexto}>
              Alguns produtos da nota fiscal não puderam ser identificados.
              Verifique o arquivo e tente novamente.
            </Text>
            <Pressable style={styles.botaoPrimario} onPress={onFecharErro}>
              <Text style={styles.botaoPrimarioTexto}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </RNModal>
    </>
  );
}

const styles = StyleSheet.create({
  centrado: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  botaoPrimario: {
    backgroundColor: "#0F14B8",
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  botaoPrimarioTexto: { color: "#fff", fontSize: 16, fontWeight: "600" },
  botaoDesabilitado: { opacity: 0.6 },

  modalContainer: { flex: 1, backgroundColor: "#F4F4F6" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitulo: { fontSize: 18, fontWeight: "700", color: "#111111", marginBottom: 6 },
  modalContadores: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  contadorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  contadorTexto: { fontSize: 12, fontWeight: "600" },
  modalFechar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avisoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  avisoTexto: { flex: 1, fontSize: 13, color: "#92400E", lineHeight: 18 },
  listaConteudo: { padding: 16, paddingBottom: 8 },
  modalRodape: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  carregandoTexto: { marginTop: 12, fontSize: 14, color: "#666666" },

  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E0E0E0" },
  cardDuplicata: { borderColor: "#7C3AED", borderWidth: 1.5 },
  cardCabecalho: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12, gap: 10 },
  cardBadge: { backgroundColor: "#E8E9FF", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, minWidth: 48, alignItems: "center" },
  cardBadgeDuplicata: { backgroundColor: "#EDE9FE" },
  cardBadgeTexto: { fontSize: 12, fontWeight: "700", color: "#0F14B8" },
  cardBadgeTextoDuplicata: { color: "#7C3AED" },
  cardNome: { flex: 1, fontSize: 15, fontWeight: "700", color: "#111111", lineHeight: 20 },
  duplicataBox: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#EDE9FE", borderRadius: 8, padding: 10, marginBottom: 12, gap: 8 },
  duplicataTexto: { flex: 1, fontSize: 13, color: "#7C3AED", lineHeight: 18 },
  linhaGrid: { flexDirection: "row", marginBottom: 12 },
  campoBox: { marginBottom: 12 },
  campo: { fontSize: 12, fontWeight: "600", color: "#666666", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  valorSomenteLeitura: { backgroundColor: "#F4F4F6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  valorTexto: { fontSize: 14, color: "#111111" },
  input: { backgroundColor: "#F4F4F6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111111", borderWidth: 1, borderColor: "#E0E0E0" },
  inputComIcone: { flexDirection: "row", alignItems: "center", backgroundColor: "#F4F4F6", borderRadius: 8, borderWidth: 1, borderColor: "#0F14B8", paddingHorizontal: 12 },
  inputPrefixo: { fontSize: 14, color: "#666666", marginRight: 6 },
  inputInterno: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#111111" },

  dropdownWrapper: { marginBottom: 12 },
  dropdownBotao: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#F4F4F6", borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", paddingHorizontal: 12, paddingVertical: 10 },
  dropdownBotaoAberto: { borderColor: "#0F14B8" },
  dropdownTexto: { fontSize: 14, color: "#111111" },
  dropdownPlaceholder: { fontSize: 14, color: "#666666" },
  dropdownLista: { marginTop: 4, backgroundColor: "#FFFFFF", borderRadius: 8, borderWidth: 1, borderColor: "#E0E0E0", overflow: "hidden", elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F4F4F6" },
  dropdownItemAtivo: { backgroundColor: "#E8E9FF" },
  dropdownItemTexto: { fontSize: 14, color: "#111111" },
  dropdownItemTextoAtivo: { color: "#0F14B8", fontWeight: "600" },
  dropdownItemTextoVazio: { fontSize: 14, color: "#666666", fontStyle: "italic" },

  modalErroOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalErroBox: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 28, alignItems: "center", width: "100%", gap: 12 },
  modalErroTitulo: { fontSize: 18, fontWeight: "700", color: "#111111" },
  modalErroTexto: { fontSize: 14, color: "#666666", textAlign: "center", lineHeight: 20 },
});