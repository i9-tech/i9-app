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

// Configuração do calendário
LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
};
LocaleConfig.defaultLocale = 'pt-br';

export default function Dashboard() {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [exibirPratos, setExibirPratos] = useState(false);
  const [modalCalendario, setModalCalendario] = useState(false);

  // Lógica de Período
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);
  const [legendaAnterior, setLegendaAnterior] = useState("(1 dia atrás)");
  const [markedDates, setMarkedDates] = useState({});

  // Estados dos KPIs
  const [lucroBruto, setLucroBruto] = useState(0);
  const [diferencaBruto, setDiferencaBruto] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [liquidoMercadoria, setLiquidoMercadoria] = useState(0);
  const [quantidadeTotalVendida, setQuantidadeTotalVendida] = useState(0);
  const [diferencaVenda, setDiferencaVenda] = useState(0);
  const [dadosPratos, setDadosPratos] = useState([]);
  const [dadosProdutos, setDadosProdutos] = useState([]);
  const [pratoMaisVendido, setPratoMaisVendido] = useState({ nome: "Nenhum", quantidadeVendida: 0 });
  const [produtoMaisVendido, setProdutoMaisVendido] = useState({ nome: "Nenhum", quantidadeVendida: 0 });

  const formatarPT = (iso) => iso ? iso.split('-').reverse().join('/') : "";

  useEffect(() => {
    global.setHeaderTitulo("Dashboard");
  }, []);

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
      setLegendaAnterior("(1 dia atrás)");
    } else {
      let start = new Date(dataInicio + "T00:00:00");
      let end = new Date(dataFim + "T00:00:00");
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const fimAnt = new Date(start);
      fimAnt.setDate(fimAnt.getDate() - 1);
      const iniAnt = new Date(fimAnt);
      iniAnt.setDate(iniAnt.getDate() - (diffDays - 1));
      setLegendaAnterior(`(${formatarPT(iniAnt.toISOString().split('T')[0])} a ${formatarPT(fimAnt.toISOString().split('T')[0])})`);

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
    global.setHeaderSubTitulo(`${formatarPT(dataInicio)} - ${formatarPT(dataFim || dataInicio)}`);
  }, [dataInicio, dataFim]);

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
        setPratoMaisVendido({ nome: "Nenhum", quantidadeVendida: 0 });
      }
    });

    api.get(`${ENDPOINTS.VENDA_TOP_PRODUTOS}/${usuario.userId}`, { headers, params }).then(res => {
      const lista = res.data || [];
      setDadosProdutos(lista);
      if (lista.length > 0) {
        setProdutoMaisVendido(lista.reduce((p, c) => (p.quantidadeVendida > c.quantidadeVendida ? p : c)));
      } else {
        setProdutoMaisVendido({ nome: "Nenhum", quantidadeVendida: 0 });
      }
    });
  }, [usuario, token, dataInicio, dataFim]);

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
              <Text style={{ fontWeight: 'bold' }}>{diferenca >= 0 ? "+" : ""}{isMoeda ? diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : diferenca} </Text>
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
              <Text style={styles.txtLabelFiltro}>PERÍODO DE ANÁLISE</Text>
              <Text style={styles.txtDataAtual}>{formatarPT(dataInicio)} — {formatarPT(dataFim || dataInicio)}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#1E22AA" />
          </Pressable>
        </View>

        <View style={styles.cardRow}>
           <CardResumo cor="#6f6df1" titulo="Faturamento Estimado" valor={lucroBruto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} diferenca={diferencaBruto} isMoeda={true} subtitulo="em relação ao período anterior" mostrarLegendaAnterior={true} />
           <CardResumo cor="#41c482" titulo="Vendas Realizadas" valor={`${quantidadeTotalVendida} vendas`} diferenca={diferencaVenda} isMoeda={false} subtitulo="em relação ao período anterior" mostrarLegendaAnterior={true} />
           <CardResumo cor="#f0b731" titulo="Lucro Bruto" valor={lucroLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} subtitulo={`${liquidoMercadoria.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em produtos`} />
           <CardResumo cor="#C60018" titulo={exibirPratos ? "Prato Mais Vendido" : "Produto Mais Vendido"} valor={exibirPratos ? pratoMaisVendido.nome : produtoMaisVendido.nome} subtitulo={`${exibirPratos ? pratoMaisVendido.quantidadeVendida : produtoMaisVendido.quantidadeVendida} unidades vendidas`} mostrarToggle={true} />
        </View>

        <View style={styles.secaoBranca}>
          <View style={styles.headerRanking}>
            <Text style={styles.tituloSecao}>TOP 7 {exibirPratos ? "Pratos" : "Produtos"} mais vendidos</Text>
            <Pressable onPress={() => setExibirPratos(!exibirPratos)} style={styles.botaoTrocaRanking}>
              <Ionicons name="repeat" size={20} color="#1E22AA" />
            </Pressable>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1 }]}>ITEM</Text>
            <Text style={styles.tableHeaderText}>QTD. VENDIDA</Text>
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
            <Text style={styles.modalTitulo}>Selecione o Intervalo</Text>
            <Calendar
              markingType={'period'}
              markedDates={markedDates}
              onDayPress={onDayPress}
              theme={{ selectedDayBackgroundColor: '#1E22AA', todayTextColor: '#1E22AA', arrowColor: '#1E22AA' }}
            />
            <Pressable style={styles.btnConfirmar} onPress={() => dataInicio && setModalCalendario(false)}>
              <Text style={styles.btnConfirmarTxt}>APLICAR FILTRO</Text>
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
  
  // FILTRO
  filtroContainer: { marginBottom: 10 },
  btnFiltroModerno: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, borderWidth: 1, borderColor: '#e6e6e6' },
  iconeCirculo: { backgroundColor: '#1E22AA', width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  textoFiltroContainer: { flex: 1 },
  txtLabelFiltro: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  txtDataAtual: { fontSize: 14, color: '#1E22AA', fontWeight: 'bold' },

  // CARDS 
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

  // RANKING / TABELA
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