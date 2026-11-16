// Textos dos atuadores (bomba: ligada/desligada; válvula: aberta/fechada)
import type { Atuador, EstadoAtuador } from '../types/api';
import { nomeSensor } from './formatar';

export function nomeAtuador(atuador: Pick<Atuador, 'codigo'>): string {
  return nomeSensor(atuador.codigo);
}

export function descreverEstado(atuador: Pick<Atuador, 'tipo'>, estado: EstadoAtuador): string {
  const ligado = estado === 'LIGADO';
  if (atuador.tipo === 'VALVULA') return ligado ? 'aberta' : 'fechada';
  return ligado ? 'ligada' : 'desligada';
}

export function acaoPara(atuador: Pick<Atuador, 'tipo'>, novoEstado: EstadoAtuador): string {
  const ligar = novoEstado === 'LIGADO';
  if (atuador.tipo === 'VALVULA') return ligar ? 'Abrir' : 'Fechar';
  return ligar ? 'Ligar' : 'Desligar';
}

export function estadoOposto(estado: EstadoAtuador): EstadoAtuador {
  return estado === 'LIGADO' ? 'DESLIGADO' : 'LIGADO';
}
