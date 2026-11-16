// Formatação de datas, números e nomes de sensores para exibição
import type { Leitura } from '../types/api';

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Converte "2026-11-16T10:20:30" (LocalDateTime do Java) ou Date em Date (horário local). */
export function paraData(valor: string | Date | null | undefined): Date | null {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(valor);
  if (partes) {
    const [ano, mes, dia, hora, minuto, segundo] = partes.slice(1).map(Number);
    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
  }
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarHora(valor: string | Date | null | undefined): string {
  const data = paraData(valor);
  if (!data) return '--:--:--';
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}`;
}

export function formatarHoraCurta(valor: string | Date | null | undefined): string {
  const data = paraData(valor);
  if (!data) return '--:--';
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
}

export function formatarDataHora(valor: string | Date | null | undefined): string {
  const data = paraData(valor);
  if (!data) return '--';
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)} ${formatarHora(data)}`;
}

/** 12.345 -> "12,3" (vírgula como separador decimal). */
export function formatarNumero(valor: number | null | undefined, casas = 1): string {
  if (valor === null || valor === undefined) return '--';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return '--';
  return numero.toFixed(casas).replace('.', ',');
}

/** 8000 -> "8.000" (separador de milhar). */
export function formatarInteiro(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '--';
  return Math.round(Number(valor))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const NOMES_SENSORES: Record<string, string> = {
  'RES-A': 'Reservatório A',
  'RES-B': 'Reservatório B',
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  'BOMBA-01': 'Bomba 1',
  'BOMBA-02': 'Bomba 2',
  'VALVULA-01': 'Válvula de distribuição',
  PAINEL: 'Painel de controle',
};

export function nomeSensor(sensor: string): string {
  return NOMES_SENSORES[sensor] ?? sensor;
}

/** Valor da leitura de um sensor dentro de uma lista de leituras (ou null). */
export function valorDoSensor(leituras: Leitura[] | null | undefined, sensor: string): number | null {
  const leitura = (leituras ?? []).find((l) => l.sensor === sensor);
  return leitura ? leitura.valor : null;
}
