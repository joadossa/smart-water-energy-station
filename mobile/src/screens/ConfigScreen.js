import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { normalizarUrl, urlPadrao, useApiConfig } from '../context/ApiConfigContext';
import { criarEstacaoApi } from '../api/estacaoApi';
import { cores } from '../theme/cores';

function Botao({ titulo, onPress, carregando = false, secundario = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={carregando}
      style={({ pressed }) => [
        estilos.botao,
        secundario && estilos.botaoSecundario,
        (pressed || carregando) && estilos.botaoPressionado,
      ]}
    >
      {carregando ? <ActivityIndicator color={cores.texto} /> : <Text style={estilos.botaoTexto}>{titulo}</Text>}
    </Pressable>
  );
}

export default function ConfigScreen() {
  const { apiUrl, salvarUrl, restaurarPadrao } = useApiConfig();
  const [texto, setTexto] = useState(apiUrl);
  const [resultado, setResultado] = useState(null); // { ok: boolean, mensagem: string }
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
      const atuadores = status?.atuadores?.length ?? 0;
      const falhas = status?.falhasAbertas ?? 0;
      setResultado({ ok: true, mensagem: `Conectado a ${url}: ${atuadores} atuadores, ${falhas} falha(s) aberta(s).` });
    } catch (e) {
      setResultado({ ok: false, mensagem: `${e.message} (${url})` });
    } finally {
      setTestando(false);
    }
  }

  async function salvar() {
    try {
      const url = await salvarUrl(texto);
      setResultado({ ok: true, mensagem: `Endereço salvo: ${url}` });
    } catch (e) {
      setResultado({ ok: false, mensagem: e.message });
    }
  }

  async function restaurar() {
    const url = await restaurarPadrao();
    setResultado({ ok: true, mensagem: `Endereço padrão restaurado: ${url}` });
  }

  return (
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
      <Text style={estilos.rotulo}>Endereço da API (backend Spring Boot)</Text>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        placeholder="http://192.168.0.10:8080"
        placeholderTextColor={cores.textoSecundario}
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
        <Text style={[estilos.resultado, { color: resultado.ok ? cores.ok : cores.critico }]}>{resultado.mensagem}</Text>
      ) : null}

      <View style={estilos.dica}>
        <Text style={estilos.dicaTitulo}>Dicas</Text>
        <Text style={estilos.dicaTexto}>• No celular, use o IP do computador onde o backend está rodando, por exemplo http://192.168.0.10:8080.</Text>
        <Text style={estilos.dicaTexto}>• Celular e computador precisam estar na mesma rede Wi-Fi.</Text>
        <Text style={estilos.dicaTexto}>• No navegador do próprio computador, use http://localhost:8080.</Text>
        <Text style={estilos.dicaTexto}>• Se a API cair, o app continua funcionando e mostra o aviso "API fora do ar".</Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 8 },
  rotulo: { color: cores.texto, fontSize: 15, fontWeight: '600' },
  input: {
    backgroundColor: cores.card,
    borderColor: cores.borda,
    borderWidth: 1,
    borderRadius: 10,
    color: cores.texto,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  info: { color: cores.textoSecundario, fontSize: 12 },
  botoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  botao: {
    backgroundColor: cores.primaria,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  botaoSecundario: { backgroundColor: cores.cardClaro },
  botaoPressionado: { opacity: 0.7 },
  botaoTexto: { color: cores.texto, fontWeight: '600' },
  resultado: { marginTop: 8, fontSize: 14 },
  dica: { marginTop: 16, backgroundColor: cores.card, borderRadius: 12, padding: 12, gap: 4 },
  dicaTitulo: { color: cores.texto, fontWeight: '700', marginBottom: 4 },
  dicaTexto: { color: cores.textoSecundario, fontSize: 13 },
});
