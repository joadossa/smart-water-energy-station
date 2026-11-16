// Textos e cores dos atuadores (bomba: ligada/desligada; válvula: aberta/fechada)
import { cores } from '../theme/cores';
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

/** Estado com inicial maiúscula, para etiquetas (ex.: "Desligada", "Aberta"). */
export function rotuloEstado(atuador: Pick<Atuador, 'tipo'>, estado: EstadoAtuador): string {
  const texto = descreverEstado(atuador, estado);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function acaoPara(atuador: Pick<Atuador, 'tipo'>, novoEstado: EstadoAtuador): string {
  const ligar = novoEstado === 'LIGADO';
  if (atuador.tipo === 'VALVULA') return ligar ? 'Abrir' : 'Fechar';
  return ligar ? 'Ligar' : 'Desligar';
}

export function estadoOposto(estado: EstadoAtuador): EstadoAtuador {
  return estado === 'LIGADO' ? 'DESLIGADO' : 'LIGADO';
}

/** Cor do estado atual: verde quando ligada/aberta, vermelho quando desligada/fechada. */
export function corDoEstado(estado: EstadoAtuador): string {
  return estado === 'LIGADO' ? cores.verde : cores.vermelho;
}

/** Cor do comando que leva ao novo estado: Ligar/Abrir em ciano, Desligar/Fechar em vermelho. */
export function corDaAcao(novoEstado: EstadoAtuador): string {
  return novoEstado === 'LIGADO' ? cores.ciano : cores.vermelho;
}
