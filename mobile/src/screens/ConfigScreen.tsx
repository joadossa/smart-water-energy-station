import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { normalizarUrl, urlPadrao, useApiConfig } from '../context/ApiConfigContext';
import { criarEstacaoApi } from '../api/estacaoApi';
import { comAlfa, cores, fontes, raio } from '../theme/cores';

interface PropsBotao {
  titulo: string;
  onPress: () => void;
  carregando?: boolean;
  secundario?: boolean;
}

function Botao({ titulo, onPress, carregando = false, secundario = false }: PropsBotao) {
  return (
    <Pressable
      onPress={onPress}
      disabled={carregando}
      style={({ pressed }) => [estilos.botao, secundario && estilos.botaoSecundario, (pressed || carregando) && { opacity: 0.7 }]}
    >
      {carregando ? (
        <ActivityIndicator color={secundario ? cores.texto : cores.fundo} />
      ) : (
        <Text style={[estilos.botaoTexto, secundario && { color: cores.texto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

export default function ConfigScreen() {
  const { apiUrl, salvarUrl, restaurarPadrao } = useApiConfig();
  const [texto, setTexto] = useState(apiUrl);
  const [resultado, setResultado] = useState<{ ok: boolean; mensagem: string } | null>(null);
  const [testando, setTestando] = useState(false);

  useEffect(() => {
    setTexto(apiUrl);
  }, [apiUrl]);

  async function testarConexao() {
    const url = normalizarUrl(texto);
    if (!url) {
      setResultado({ ok: false, mensagem: 'Informe o endereço da API.' });
      return;
    }
    setTestando(true);
    setResultado(null);
    try {
      const status = await criarEstacaoApi(url).buscarStatus();
      setResultado({
        ok: true,
        mensagem: `Conectado a ${url}: ${status.atuadores.length} atuadores, ${status.falhasAbertas} falha(s) aberta(s).`,
      });
    } catch (e) {
      setResultado({ ok: false, mensagem: `${e instanceof Error ? e.message : String(e)} (${url})` });
    } finally {
      setTestando(false);
    }
  }

  async function salvar() {
    try {
      const url = await salvarUrl(texto);
      setResultado({ ok: true, mensagem: `Endereço salvo: ${url}` });
    } catch (e) {
      setResultado({ ok: false, mensagem: e instanceof Error ? e.message : String(e) });
    }
  }

  async function restaurar() {
    const url = await restaurarPadrao();
    setResultado({ ok: true, mensagem: `Endereço padrão restaurado: ${url}` });
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <View style={estilos.card}>
        <Text style={estilos.rotulo}>Endereço da API (backend Spring Boot)</Text>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://<IP-do-computador>:8080"
          placeholderTextColor={cores.textoFraco}
          style={estilos.input}
        />
        <Text style={estilos.info}>Em uso: {apiUrl}</Text>
        <Text style={estilos.info}>Padrão detectado: {urlPadrao()}</Text>

        <View style={estilos.botoes}>
          <Botao titulo="Testar conexão" onPress={testarConexao} carregando={testando} />
          <Botao titulo="Salvar" onPress={salvar} />
          <Botao titulo="Restaurar padrão" onPress={restaurar} secundario />
        </View>

        {resultado ? (
          <View style={[estilos.resultado, { borderColor: comAlfa(resultado.ok ? cores.verde : cores.vermelho, 0.5) }]}>
            <Ionicons
              name={resultado.ok ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={18}
              color={resultado.ok ? cores.verde : cores.vermelho}
            />
            <Text style={[estilos.resultadoTexto, { color: resultado.ok ? cores.verde : cores.vermelho }]}>{resultado.mensagem}</Text>
          </View>
        ) : null}
      </View>

      <View style={estilos.card}>
        <Text style={estilos.titulo}>Qual endereço usar?</Text>
        <Dica titulo="Celular físico (Expo Go)" texto="IP do computador na rede local, ex.: http://192.168.x.x:8080. Celular e computador na mesma rede Wi-Fi." />
        <Dica titulo="Navegador no computador / simulador iOS" texto="http://localhost:8080" />
        <Dica titulo="Emulador Android" texto="http://10.0.2.2:8080 (no emulador, 10.0.2.2 aponta para o computador)." />
        <Dica titulo="API fora do ar" texto="O app continua funcionando e mostra a última leitura disponível, com as ações desabilitadas." />
      </View>
    </ScrollView>
  );
}

function Dica({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <View style={estilos.dica}>
      <Text style={estilos.dicaTitulo}>{titulo}</Text>
      <Text style={estilos.dicaTexto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 12 },
  card: { backgroundColor: cores.card, borderColor: cores.borda, borderWidth: 1, borderRadius: raio.card, padding: 16, gap: 8 },
  rotulo: { color: cores.texto, fontFamily: fontes.seminegrito, fontSize: 14 },
  titulo: { color: cores.texto, fontFamily: fontes.titulo, fontSize: 16, marginBottom: 4 },
  input: {
    backgroundColor: cores.fundo,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: raio.controle,
    color: cores.texto,
    fontFamily: fontes.regular,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  info: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  botao: { backgroundColor: cores.ciano, paddingVertical: 10, paddingHorizontal: 14, borderRadius: raio.controle, minWidth: 120, alignItems: 'center' },
  botaoSecundario: { backgroundColor: cores.cardElevado },
  botaoTexto: { color: cores.fundo, fontFamily: fontes.seminegrito },
  resultado: { flexDirection: 'row', gap: 8, alignItems: 'center', borderWidth: 1, borderRadius: raio.controle, padding: 10, marginTop: 4 },
  resultadoTexto: { flex: 1, fontFamily: fontes.regular, fontSize: 13 },
  dica: { gap: 2, paddingVertical: 4 },
  dicaTitulo: { color: cores.texto, fontFamily: fontes.media, fontSize: 13 },
  dicaTexto: { color: cores.textoSecundario, fontFamily: fontes.regular, fontSize: 12 },
});
