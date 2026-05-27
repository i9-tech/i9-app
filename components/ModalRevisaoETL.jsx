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
import { useTranslation } from "react-i18next";

const CORES = {
  primaria: "#0F14B8",
  fundo: "#F4F4F6",
  branco: "#FFFFFF",
  texto: "#1C1C1E",
  textoSuave: "#8E8E93",
  borda: "#E3E5EC",
  sucesso: "#16A34A",
  sucessoSuave: "#DCFCE7",
  erro: "#DC2626",
  aviso: "#D97706",
  duplicata: "#7C3AED",
  duplicataSuave: "#EDE9FE",
};

function Dropdown({
  placeholder,
  opcoes,
  valorSelecionado,
  aoSelecionar,
  rotulo,
}) {
  const [aberto, setAberto] = React.useState(false);
  const { t } = useTranslation();
  const labelSelecionado = opcoes.find((o) => o.id === valorSelecionado)?.nome;

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.labelSecao}>{rotulo}</Text>
      <Pressable
        style={[styles.dropdownBotao, aberto && styles.dropdownBotaoAberto]}
        onPress={() => setAberto((v) => !v)}
      >
        <Text
          style={
            labelSelecionado ? styles.dropdownTexto : styles.dropdownPlaceholder
          }
          numberOfLines={1}
        >
          {labelSelecionado ?? placeholder}
        </Text>
        <Ionicons
          name={aberto ? "chevron-up" : "chevron-down"}
          size={14}
          color={CORES.textoSuave}
        />
      </Pressable>
      {aberto && (
        <View style={styles.dropdownLista}>
          <Pressable
            style={styles.dropdownItem}
            onPress={() => {
              aoSelecionar(null);
              setAberto(false);
            }}
          >
            <Text style={styles.dropdownItemTextoVazio}>
              {t("camera.dropdown_nenhum")}
            </Text>
          </Pressable>
          {opcoes.map((opcao) => (
            <Pressable
              key={opcao.id}
              style={[
                styles.dropdownItem,
                opcao.id === valorSelecionado && styles.dropdownItemAtivo,
              ]}
              onPress={() => {
                aoSelecionar(opcao.id);
                setAberto(false);
              }}
            >
              <Text
                style={[
                  styles.dropdownItemTexto,
                  opcao.id === valorSelecionado &&
                    styles.dropdownItemTextoAtivo,
                ]}
              >
                {opcao.nome}
              </Text>
              {opcao.id === valorSelecionado && (
                <Ionicons name="checkmark" size={14} color={CORES.primaria} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ProdutoCard({
  produto,
  indice,
  total,
  onChange,
  setores,
  categorias,
}) {
  const { t } = useTranslation();
  const atualizar = (campo, valor) => onChange(indice, campo, valor);
  const ehDuplicata = produto.duplicata === true;
  const totalItem =
    Number(produto.valor_compra || 0) * Number(produto.quantidade || 0);

  return (
    <View style={[styles.card, ehDuplicata && styles.cardDuplicata]}>
      {/* Badge posição */}
      <View
        style={[
          styles.badgePosicao,
          ehDuplicata && styles.badgePosicaoDuplicata,
        ]}
      >
        <Text
          style={[
            styles.badgePosicaoTexto,
            ehDuplicata && styles.badgePosicaoTextoDuplicata,
          ]}
        >
          {indice + 1} / {total}
        </Text>
      </View>

      {/* Aviso duplicata */}
      {ehDuplicata && (
        <View style={styles.duplicataBox}>
          <Ionicons name="sync-outline" size={14} color={CORES.duplicata} />
          <Text style={styles.duplicataTexto}>
            {t("camera.card_duplicata_aviso")}
          </Text>
        </View>
      )}

      {/* Nome + Total */}
      <View style={styles.linhaNomeTotal}>
        <View style={styles.inputNomeContainer}>
          <Ionicons
            name="cube-outline"
            size={16}
            color={CORES.textoSuave}
            style={{ marginRight: 6 }}
          />
          <TextInput
            value={produto.nome || ""}
            onChangeText={(v) => atualizar("nome", v)}
            placeholder={t("camera.card_placeholder_nome")}
            placeholderTextColor={CORES.textoSuave}
            style={styles.inputNome}
          />
          <Ionicons name="create-outline" size={16} color="#B8B8C2" />
        </View>
        <View style={styles.totalBox}>
          <View style={styles.totalBoxHeader}>
            <Text style={styles.totalLabel}>{t("camera.card_total")}</Text>
            <View style={styles.totalLock}>
              <Ionicons name="lock-closed" size={8} color="#FFF" />
            </View>
          </View>
          <Text
            style={styles.totalValor}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalItem)}
          </Text>
        </View>
      </View>

      {/* Custo + Quantidade */}
      <View style={styles.linhaGrid}>
        <View style={[styles.somenteLeituraBox, { flex: 1 }]}>
          <View style={styles.somenteLeituraHeader}>
            <Text style={styles.labelCampo}>{t("camera.card_custo_unit")}</Text>
            <View style={styles.lockBadge}>
              <Ionicons
                name="lock-closed"
                size={8}
                color="#434343"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.lockBadgeTexto}>{t("camera.card_fixo")}</Text>
            </View>
          </View>
          <Text style={styles.somenteLeituraTexto}>
            {produto.valor_compra != null
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(produto.valor_compra))
              : "—"}
          </Text>
        </View>
        <View style={[styles.somenteLeituraBox, { width: 100 }]}>
          <View style={styles.somenteLeituraHeader}>
            <Text style={styles.labelCampo}>{t("camera.card_qtd")}</Text>
            <View style={[styles.lockBadge, { paddingHorizontal: 4 }]}>
              <Ionicons name="lock-closed" size={8} color="#434343" />
            </View>
          </View>
          <Text style={styles.somenteLeituraTexto}>
            {Number(produto.quantidade || 0)} un.
          </Text>
        </View>
      </View>

      {/* Preço de venda */}
      <View style={{ marginTop: 14 }}>
        <Text style={styles.labelSecao}>{t("camera.campo_preco_venda")}</Text>
        <View style={styles.inputPrecoContainer}>
          <Text style={styles.inputPrecoPrefixo}>R$</Text>
          <TextInput
            value={produto.preco_venda}
            placeholder="0,00"
            placeholderTextColor="#B8B8C2"
            keyboardType="numeric"
            onChangeText={(v) => atualizar("preco_venda", v)}
            style={styles.inputPreco}
          />
        </View>
      </View>

      {/* Estoque mín/máx */}
      {!ehDuplicata && (
        <View style={[styles.linhaGrid, { marginTop: 14 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.labelSecao}>
              {t("camera.card_estoque_min")}
            </Text>
            <TextInput
              style={styles.inputSimples}
              keyboardType="numeric"
              value={String(produto.quantidade_min ?? 10)}
              onChangeText={(v) =>
                atualizar("quantidade_min", parseInt(v) || 0)
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.labelSecao}>
              {t("camera.card_estoque_max")}
            </Text>
            <TextInput
              style={styles.inputSimples}
              keyboardType="numeric"
              value={String(produto.quantidade_max ?? 100)}
              onChangeText={(v) =>
                atualizar("quantidade_max", parseInt(v) || 0)
              }
            />
          </View>
        </View>
      )}

      {/* Setor + Categoria */}
      <View style={{ marginTop: 14 }}>
        <Text style={styles.labelSecao}>{t("camera.campo_organizacao")}</Text>
        <View style={styles.linhaGrid}>
          <Dropdown
            rotulo={t("camera.dropdown_setor")}
            placeholder={t("camera.dropdown_automatico")}
            opcoes={setores}
            valorSelecionado={produto.setor_id}
            aoSelecionar={(v) => atualizar("setor_id", v)}
          />
          <Dropdown
            rotulo={t("camera.dropdown_categoria")}
            placeholder={t("camera.dropdown_automatica")}
            opcoes={categorias}
            valorSelecionado={produto.categoria_id}
            aoSelecionar={(v) => atualizar("categoria_id", v)}
          />
        </View>
      </View>
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
  const { t } = useTranslation();
  const qtdDuplicatas = produtos.filter((p) => p.duplicata).length;
  const qtdNovos = produtos.length - qtdDuplicatas;
  const totalGeral = produtos.reduce(
    (acc, p) => acc + Number(p.valor_compra || 0) * Number(p.quantidade || 0),
    0,
  );

  return (
    <>
      <RNModal
        visible={visivel}
        animationType="slide"
        transparent
        onRequestClose={onFechar}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitulo}>
                  {t("camera.modal_etl_titulo")}
                </Text>
                <Text style={styles.modalSubtitulo}>
                  {t("camera.modal_etl_subtitulo")}
                </Text>
              </View>
              <Pressable style={styles.botaoFechar} onPress={onFechar}>
                <Ionicons name="close" size={20} color={CORES.texto} />
              </Pressable>
            </View>

            {/* Badges */}
            <View style={styles.contagemRow}>
              {qtdNovos > 0 && (
                <View style={styles.contadorBadge}>
                  <Ionicons
                    name="add-circle-outline"
                    size={12}
                    color={CORES.sucesso}
                  />
                  <Text
                    style={[styles.contadorTexto, { color: CORES.sucesso }]}
                  >
                    {t("camera.badge_novos", { qtd: qtdNovos })}
                  </Text>
                </View>
              )}
              {qtdDuplicatas > 0 && (
                <View
                  style={[
                    styles.contadorBadge,
                    { backgroundColor: CORES.duplicataSuave },
                  ]}
                >
                  <Ionicons
                    name="sync-outline"
                    size={12}
                    color={CORES.duplicata}
                  />
                  <Text
                    style={[styles.contadorTexto, { color: CORES.duplicata }]}
                  >
                    {t("camera.badge_existentes", { qtd: qtdDuplicatas })}
                  </Text>
                </View>
              )}
            </View>

            {/* Aviso */}
            <View style={styles.avisoBox}>
              <Ionicons
                name="information-circle-outline"
                size={14}
                color={CORES.aviso}
              />
              <Text style={styles.avisoTexto}>
                {t("camera.aviso_instrucao")}
              </Text>
            </View>

            {/* Lista */}
            {carregando ? (
              <View style={styles.centrado}>
                <ActivityIndicator size="large" color={CORES.primaria} />
                <Text style={styles.carregandoTexto}>
                  {t("camera.verificando_produtos")}
                </Text>
              </View>
            ) : (
              <FlatList
                data={produtos}
                keyExtractor={(_, i) => String(i)}
                contentContainerStyle={styles.listaConteudo}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => (
                  <View style={styles.totalGeralBox}>
                    <Text style={styles.totalGeralLabel}>
                      {t("camera.campo_total_geral")}
                    </Text>
                    <Text style={styles.totalGeralValor}>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(totalGeral)}
                    </Text>
                  </View>
                )}
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

            {/* Rodapé */}
            <View style={styles.modalRodape}>
              <Pressable
                style={[
                  styles.botaoConfirmar,
                  salvando && styles.botaoDesabilitado,
                ]}
                onPress={onConfirmar}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.botaoConfirmarTexto}>
                      {t("camera.confirmar_avancar")}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </RNModal>

      {/* Modal erro */}
      <RNModal
        visible={erroVisivel}
        animationType="fade"
        transparent
        onRequestClose={onFecharErro}
      >
        <View style={styles.modalErroOverlay}>
          <View style={styles.modalErroBox}>
            <Ionicons name="warning-outline" size={44} color={CORES.erro} />
            <Text style={styles.modalErroTitulo}>
              {t("camera.erro_leitura_titulo")}
            </Text>
            <Text style={styles.modalErroTexto}>
              {t("camera.erro_leitura_texto")}
            </Text>
            <Pressable style={styles.botaoConfirmar} onPress={onFecharErro}>
              <Text style={styles.botaoConfirmarTexto}>
                {t("camera.entendido")}
              </Text>
            </Pressable>
          </View>
        </View>
      </RNModal>
    </>
  );
}

const styles = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    backgroundColor: "#F4F4F6",
    width: "100%",
    height: "92%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F4",
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  modalSubtitulo: {
    marginTop: 3,
    fontSize: 12,
    color: "#8E8E93",
    lineHeight: 16,
  },
  botaoFechar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F4F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  contagemRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  contadorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  contadorTexto: { fontSize: 11, fontWeight: "600" },

  avisoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEF3C7",
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 2,
    borderRadius: 10,
    padding: 10,
    gap: 7,
  },
  avisoTexto: { flex: 1, fontSize: 12, color: "#92400E", lineHeight: 17 },

  listaConteudo: { padding: 14, paddingBottom: 6 },
  carregandoTexto: { marginTop: 10, fontSize: 13, color: "#666666" },

  modalRodape: {
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F1F4",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#E3E5EC",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  cardDuplicata: { borderColor: "#7C3AED" },

  badgePosicao: {
    alignSelf: "flex-start",
    backgroundColor: "#FAFAFC",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#ECECF2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgePosicaoDuplicata: { backgroundColor: "#EDE9FE", borderColor: "#D8B4FE" },
  badgePosicaoTexto: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0F14B8",
    letterSpacing: 0.3,
  },
  badgePosicaoTextoDuplicata: { color: "#7C3AED" },

  duplicataBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EDE9FE",
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
    gap: 6,
  },
  duplicataTexto: { flex: 1, fontSize: 12, color: "#7C3AED", lineHeight: 17 },

  linhaNomeTotal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  inputNomeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E9F2",
    paddingHorizontal: 12,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  inputNome: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
    paddingVertical: 0,
  },
  totalBox: {
    width: 100,
    minHeight: 48,
    backgroundColor: "#0F14B8",
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  totalBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: 4,
  },
  totalLabel: {
    color: "#C7CBFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  totalLock: {
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  totalValor: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },

  linhaGrid: { flexDirection: "row", gap: 8, marginTop: 10 },

  somenteLeituraBox: {
    backgroundColor: "#d4d4d48a",
    padding: 10,
    borderRadius: 12,
  },
  somenteLeituraHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  labelCampo: { fontSize: 10, color: "#8E8E93", fontWeight: "700" },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#bfc3cafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  lockBadgeTexto: { fontSize: 8, color: "#5F6368", fontWeight: "800" },
  somenteLeituraTexto: { fontSize: 13, color: "#1C1C1E", fontWeight: "800" },

  labelSecao: {
    fontSize: 10,
    fontWeight: "700",
    color: "#636366",
    marginBottom: 6,
    letterSpacing: 0.4,
  },

  inputPrecoContainer: {
    backgroundColor: "#FAFAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E7E9F2",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  inputPrecoPrefixo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F14B8",
    marginRight: 6,
  },
  inputPreco: {
    flex: 1,
    fontSize: 18,
    color: "#1C1C1E",
    fontWeight: "700",
    paddingVertical: 12,
  },

  inputSimples: {
    backgroundColor: "#FAFAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECF2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#1C1C1E",
  },

  dropdownBotao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECF2",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownBotaoAberto: { borderColor: "#0F14B8" },
  dropdownTexto: { fontSize: 12, color: "#1C1C1E", flex: 1 },
  dropdownPlaceholder: { fontSize: 12, color: "#8E8E93", flex: 1 },
  dropdownLista: {
    marginTop: 3,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECECF2",
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    zIndex: 999,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F4F6",
  },
  dropdownItemAtivo: { backgroundColor: "#E8E9FF" },
  dropdownItemTexto: { fontSize: 13, color: "#1C1C1E" },
  dropdownItemTextoAtivo: { color: "#0F14B8", fontWeight: "600" },
  dropdownItemTextoVazio: {
    fontSize: 13,
    color: "#8E8E93",
    fontStyle: "italic",
  },

  totalGeralBox: {
    backgroundColor: "#0F14B8",
    borderRadius: 20,
    padding: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  totalGeralLabel: {
    color: "#C7CBFF",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  totalGeralValor: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },

  botaoConfirmar: {
    backgroundColor: "#0F14B8",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#0F14B8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  botaoConfirmarTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  botaoDesabilitado: { opacity: 0.6 },

  modalErroOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalErroBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  modalErroTitulo: { fontSize: 17, fontWeight: "700", color: "#1C1C1E" },
  modalErroTexto: {
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 19,
  },
});
