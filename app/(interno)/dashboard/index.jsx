import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";
import api from "../../../provider/api";
import { ENDPOINTS } from "../../../utils/endpoints";
import { buscarUsuario, recuperarToken } from "../../../utils/storage";
import { useTranslation } from "react-i18next";

LocaleConfig.locales['pt'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
};

LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  LocaleConfig.defaultLocale = i18n.language || 'pt';

  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [exibirPratos, setExibirPratos] = useState(false);
  const [modalCalendario, setModalCalendario] = useState(false);

  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [legendaAnterior, setLegendaAnterior] = useState(t("dashboard.dia_atras"));
  const [markedDates, setMarkedDates] = useState({});

  const [lucroBruto, setLucroBruto] = useState(0);
  const [diferencaBruto, setDiferencaBruto] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [liquidoMercadoria, setLiquidoMercadoria] = useState(0);
  const [quantidadeTotalVendida, setQuantidadeTotalVendida] = useState(0);
  const [diferencaVenda, setDiferencaVenda] = useState(0);
  const [dadosPratos, setDadosPratos] = useState([]);
  const [dadosProdutos, setDadosProdutos] = useState([]);
  const [pratoMaisVendido, setPratoMaisVendido] = useState({ nome: t("dashboard.nenhum"), quantidadeVendida: 0 });
  const [produtoMaisVendido, setProdutoMaisVendido] = useState({ nome: t("dashboard.nenhum"), quantidadeVendida: 0 });

  const formatarDataLocal = (iso) => {
    if (!iso) return "";
    const [ano, mes, dia] = iso.split('-');
    if (i18n.language === 'en') return `${mes}/${dia}/${ano}`;
    return `${dia}/${mes}/${ano}`;
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString(i18n.language, { style: 'currency', currency: 'BRL' });
  };

  useEffect(() => {
    const agora = new Date();

    const dataFormatada = agora.toLocaleDateString(i18n.language, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const horaFormatada = agora.toLocaleTimeString(i18n.language, {
      hour: "2-digit",
      minute: "2-digit",
    });

    global.setHeaderTitulo(t("dashboard.header_titulo"));
    global.setHeaderSubTitulo(`${dataFormatada} - ${horaFormatada}`);
  }, [t, i18n.language]);

  useEffect(() => {
    buscarUsuario().then((dados) => setUsuario(dados));
    recuperarToken().then((t) => setToken(t));
  }, []);

  useEffect(() => {
    let marked = {};
    if (dataInicio) {
      marked[dataInicio] = { startingDay: true, color: '#1E22AA', textColor: 'white' };
    }

    if (!dataFim || dataInicio === dataFim) {
      setLegendaAnterior(t("dashboard.dia_atras"));
    } else {
      let start = new Date(dataInicio + "T00:00:00");
      let end = new Date(dataFim + "T00:00:00");
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const fimAnt = new Date(start);
      fimAnt.setDate(fimAnt.getDate() - 1);
      const iniAnt = new Date(fimAnt);
      iniAnt.setDate(iniAnt.getDate() - (diffDays - 1));
      
      setLegendaAnterior(t("dashboard.periodo", { 
        inicio: formatarDataLocal(iniAnt.toISOString().split('T')[0]), 
        fim: formatarDataLocal(fimAnt.toISOString().split('T')[0]) 
      }));

      let curr = new Date(start);
      curr.setDate(curr.getDate() + 1);
      while (curr < end) {
        let str = curr.toISOString().split('T')[0];
        marked[str] = { color: '#e0e0ff', textColor: '#1E22AA' };
        curr.setDate(curr.getDate() + 1);
      }
      marked[dataFim] = { endingDay: true, color: '#1E22AA', textColor: 'white' };
    }
    setMarkedDates(marked);
  }, [dataInicio, dataFim, t, i18n.language]);

  useEffect(() => {
    if (!usuario || !token) return;
    const headers = { Authorization: `Bearer ${token}` };
    const params = { dataInicio, dataFim: dataFim || dataInicio };

    api.get(`${ENDPOINTS.VENDA_KPIS}/${usuario.userId}`, { headers, params }).then((res) => {
      if (res.data && res.data[0]) {
        const kpi = res.data[0];
        setLucroBruto(kpi.lucroDiario || 0);
        setDiferencaBruto((kpi.lucroDiario || 0) - (kpi.lucroDiarioOntem || 0));
        setLucroLiquido(kpi.lucroLiquidoDiario || 0);
        setLiquidoMercadoria(kpi.totalMercadoriaDiario || 0);
        setQuantidadeTotalVendida(kpi.vendasDiaria || 0);
        setDiferencaVenda((kpi.vendasDiaria || 0) - (kpi.vendasDiariaOntem || 0));
      }
    });

    api.get(`${ENDPOINTS.VENDA_TOP_PRATOS}/${usuario.userId}`, { headers, params }).then(res => {
      const lista = res.data || [];
      setDadosPratos(lista);
      if (lista.length > 0) {
        setPratoMaisVendido(lista.reduce((p, c) => (p.quantidadeVendida > c.quantidadeVendida ? p : c)));
      } else {
        setPratoMaisVendido({ nome: t("dashboard.nenhum"), quantidadeVendida: 0 });
      }
    });

    api.get(`${ENDPOINTS.VENDA_TOP_PRODUTOS}/${usuario.userId}`, { headers, params }).then(res => {
      const lista = res.data || [];
      setDadosProdutos(lista);
      if (lista.length > 0) {
        setProdutoMaisVendido(lista.reduce((p, c) => (p.quantidadeVendida > c.quantidadeVendida ? p : c)));
      } else {
        setProdutoMaisVendido({ nome: t("dashboard.nenhum"), quantidadeVendida: 0 });
      }
    });
  }, [usuario, token, dataInicio, dataFim, t]);

  const onDayPress = (day) => {
    if (!dataInicio || (dataInicio && dataFim)) {
      setDataInicio(day.dateString);
      setDataFim(null);
    } else {
      if (day.dateString < dataInicio) {
        setDataInicio(day.dateString);
        setDataFim(null);
      } else {
        setDataFim(day.dateString);
      }
    }
  };

  const CardResumo = ({ cor, titulo, valor, subtitulo, diferenca, isMoeda, mostrarToggle, mostrarLegendaAnterior }) => (
    <View style={styles.card}>
      <View style={[styles.barraStatus, { backgroundColor: cor }]} />
      <View style={styles.cardInfo}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.cardLabel}>{titulo}</Text>
          {mostrarToggle && (
            <Pressable onPress={() => setExibirPratos(!exibirPratos)} style={styles.botaoTrocaCard}>
              <Ionicons name="repeat" size={18} color="#1E22AA" />
            </Pressable>
          )}
        </View>
        <Text style={styles.cardValue}>{valor}</Text>
        <View style={styles.containerSubtitulo}>
          <Text style={[styles.cardSubtitulo, { color: diferenca >= 0 ? "#41c482" : "#d35757" }]}>
            {diferenca !== undefined && (
              <Text style={{ fontWeight: 'bold' }}>{diferenca >= 0 ? "+" : ""}{isMoeda ? formatarMoeda(diferenca) : diferenca} </Text>
            )}
            <Text style={styles.cardSubtituloBase}>
              {subtitulo} {mostrarLegendaAnterior && <Text style={styles.txtPeriodoLinha}>{legendaAnterior}</Text>}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#f2f2f2" />
      <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.filtroContainer}>
          <Pressable
            style={({ pressed }) => [styles.btnFiltroModerno, pressed && { opacity: 0.8 }]}
            onPress={() => setModalCalendario(true)}
          >
            <View style={styles.iconeCirculo}>
              <Ionicons name="calendar" size={18} color="#fff" />
            </View>
            <View style={styles.textoFiltroContainer}>
              <Text style={styles.txtLabelFiltro}>{t("dashboard.periodo_analise")}</Text>
              <Text style={styles.txtDataAtual}>{formatarDataLocal(dataInicio)} — {formatarDataLocal(dataFim || dataInicio)}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#1E22AA" />
          </Pressable>
        </View>

        <View style={styles.cardRow}>
          <CardResumo 
            cor="#6f6df1" 
            titulo={t("dashboard.faturamento_estimado")} 
            valor={formatarMoeda(lucroBruto)} 
            diferenca={diferencaBruto} 
            isMoeda={true} 
            subtitulo={t("dashboard.em_relacao_anterior")} 
            mostrarLegendaAnterior={true} 
          />
          <CardResumo 
            cor="#41c482" 
            titulo={t("dashboard.vendas_realizadas")} 
            valor={t("dashboard.vendas", { count: quantidadeTotalVendida })} 
            diferenca={diferencaVenda} 
            isMoeda={false} 
            subtitulo={t("dashboard.em_relacao_anterior")} 
            mostrarLegendaAnterior={true} 
          />
          <CardResumo 
            cor="#f0b731" 
            titulo={t("dashboard.lucro_bruto")} 
            valor={formatarMoeda(lucroLiquido)} 
            subtitulo={t("dashboard.em_produtos", { valor: formatarMoeda(liquidoMercadoria) })} 
          />
          <CardResumo 
            cor="#C60018" 
            titulo={exibirPratos ? t("dashboard.prato_mais_vendido") : t("dashboard.produto_mais_vendido")} 
            valor={exibirPratos ? pratoMaisVendido.nome : produtoMaisVendido.nome} 
            subtitulo={t("dashboard.unidades_vendidas", { count: exibirPratos ? pratoMaisVendido.quantidadeVendida : produtoMaisVendido.quantidadeVendida })} 
            mostrarToggle={true} 
          />
        </View>

        <View style={styles.secaoBranca}>
          <View style={styles.headerRanking}>
            <Text style={styles.tituloSecao}>
              {exibirPratos ? t("dashboard.top_pratos") : t("dashboard.top_produtos")}
            </Text>
            <Pressable onPress={() => setExibirPratos(!exibirPratos)} style={styles.botaoTrocaRanking}>
              <Ionicons name="repeat" size={20} color="#1E22AA" />
            </Pressable>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>{t("dashboard.tabela_item")}</Text>
            <Text style={styles.tableHeaderText}>{t("dashboard.tabela_qtd")}</Text>
          </View>

          {(exibirPratos ? dadosPratos : dadosProdutos).slice(0, 7).map((item, index, arr) => (
            <View key={index} style={[styles.itemRanking, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.nomeItem} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.statusNumber}>{item.quantidadeVendida}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal visible={modalCalendario} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>{t("dashboard.selecione_intervalo")}</Text>
            <Calendar
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{ selectedDayBackgroundColor: '#1E22AA', todayTextColor: '#1E22AA', arrowColor: '#1E22AA' }}
            />
            <Pressable style={styles.btnConfirmar} onPress={() => dataInicio && setModalCalendario(false)}>
              <Text style={styles.btnConfirmarTxt}>{t("dashboard.aplicar_filtro")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f2f2f2" },
  container: { padding: 16 },

  filtroContainer: { marginBottom: 10 },
  btnFiltroModerno: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, borderWidth: 1, borderColor: '#e6e6e6' },
  iconeCirculo: { backgroundColor: '#1E22AA', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textoFiltroContainer: { flex: 1 },
  txtLabelFiltro: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  txtDataAtual: { fontSize: 14, color: '#1E22AA', fontWeight: 'bold' },

  cardRow: { gap: 10, marginVertical: 10 },
  card: { backgroundColor: "#fff", borderRadius: 12, minHeight: 95, flexDirection: "row", elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3 },
  barraStatus: { width: 10, height: "100%", borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  cardInfo: { flex: 1, paddingHorizontal: 15, justifyContent: "center", paddingVertical: 10 },
  cardValue: { fontWeight: "bold", fontSize: 16, color: "#333", textAlign: 'left' },
  cardLabel: { fontSize: 12, color: "#666", textAlign: 'left' },

  containerSubtitulo: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  cardSubtitulo: { fontSize: 11 },
  cardSubtituloBase: { color: "#999" },
  txtPeriodoLinha: { fontSize: 10, color: "#bbb" },

  secaoBranca: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginTop: 10, elevation: 3 },
  headerRanking: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  tituloSecao: { fontSize: 15, fontWeight: "bold", color: "#444" },
  botaoTrocaRanking: { padding: 8, borderRadius: 8, backgroundColor: "#f0f0ff" },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#f2f2f2', marginBottom: 5 },
  tableHeaderText: { fontSize: 10, fontWeight: '800', color: '#aaa', letterSpacing: 1 },
  itemRanking: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f2f2f2" },
  nomeItem: { fontSize: 14, color: "#333", flex: 1 },
  statusNumber: { fontWeight: "bold", fontSize: 16, color: "#1E22AA" },

  botaoTrocaCard: { padding: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  btnConfirmar: { backgroundColor: '#1E22AA', padding: 14, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  btnConfirmarTxt: { color: '#fff', fontWeight: 'bold' }
});