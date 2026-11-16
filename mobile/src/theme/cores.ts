import type { Severidade } from '../types/api';

// Paleta "Industrial Dark"
export const cores = {
  fundo: '#0B1220',
  card: '#111C2E',
  cardElevado: '#17243A',
  borda: '#1F2D45',
  texto: '#F8FAFC',
  textoSecundario: '#A8B4C8',
  textoFraco: '#6E7C94',
  ciano: '#16D9E3',
  azul: '#648CFF',
  verde: '#22C55E',
  amarelo: '#F5B942',
  laranja: '#F59E42',
  vermelho: '#F26464',
};

// Cor de cada severidade de falha vinda da API
export const coresSeveridade: Record<Severidade, string> = {
  BAIXA: cores.azul,
  MEDIA: cores.amarelo,
  ALTA: cores.laranja,
  CRITICA: cores.vermelho,
};

// Famílias carregadas em App.tsx (@expo-google-fonts)
export const fontes = {
  regular: 'Inter_400Regular',
  media: 'Inter_500Medium',
  seminegrito: 'Inter_600SemiBold',
  titulo: 'FiraSans_600SemiBold',
  tituloMedio: 'FiraSans_500Medium',
};

export const raio = {
  card: 14,
  controle: 10,
  pilula: 999,
};

/** Aplica transparência a uma cor hexadecimal de 6 dígitos (ex.: comAlfa('#16D9E3', 0.15)). */
export function comAlfa(cor: string, alfa: number): string {
  const hex = Math.round(Math.max(0, Math.min(1, alfa)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${cor}${hex}`;
}
