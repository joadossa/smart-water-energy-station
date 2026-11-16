// Formatação de datas, números e nomes de sensores para exibição

const doisDigitos = (n) => String(n).padStart(2, '0');

/** Converte "2026-11-16T10:20:30" (LocalDateTime do Java) ou Date em Date (horário local). */
export function paraData(valor) {
  if (!valor) return null;
  if (valor instanceof Date) return valor;
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(String(valor));
  if (partes) {
    const [, ano, mes, dia, hora, minuto, segundo] = partes.map(Number);
    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
  }
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

export function formatarHora(valor) {
  const data = paraData(valor);
  if (!data) return '--:--:--';
  return `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}`;
}

export function formatarDataHora(valor) {
  const data = paraData(valor);
  if (!data) return '--';
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)} ${formatarHora(data)}`;
}

/** 12.345 -> "12,3" (vírgula como separador decimal). */
export function formatarNumero(valor, casas = 1) {
  if (valor === null || valor === undefined) return '--';
  const numero = Number(valor);
  if (Number.isNaN(numero)) return '--';
  return numero.toFixed(casas).replace('.', ',');
}

const NOMES_SENSORES = {
  'RES-A': 'Reservatório A',
  'RES-B': 'Reservatório B',
  ENTRADA: 'Entrada',
  SAIDA: 'Saída',
  'BOMBA-01': 'Bomba 01',
  'BOMBA-02': 'Bomba 02',
  PAINEL: 'Painel de controle',
};

export function nomeSensor(sensor) {
  return NOMES_SENSORES[sensor] || sensor;
}

/** Valor da leitura de um sensor dentro de uma lista de leituras (ou null). */
export function valorDoSensor(leituras, sensor) {
  const leitura = (leituras || []).find((l) => l.sensor === sensor);
  return leitura ? leitura.valor : null;
}
