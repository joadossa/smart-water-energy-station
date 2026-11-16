// Tipos dos dados trocados com a API REST do backend (Spring Boot)

export type TipoLeitura = 'NIVEL' | 'VAZAO' | 'ENERGIA';
export type TipoAtuador = 'BOMBA' | 'VALVULA';
export type EstadoAtuador = 'LIGADO' | 'DESLIGADO';
export type Severidade = 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type FiltroFalhas = 'ABERTAS' | 'RESOLVIDAS' | 'TODAS';

/** Data/hora no formato do LocalDateTime do Java, ex.: "2026-11-16T10:20:30". */
export type DataHoraIso = string;

export interface Leitura {
  id: number;
  tipo: TipoLeitura;
  sensor: string;
  valor: number;
  unidade: string;
  dataHora: DataHoraIso;
}

export interface NovaLeitura {
  tipo: TipoLeitura;
  sensor: string;
  valor: number;
  unidade?: string;
}

export interface Atuador {
  id: number;
  codigo: string;
  nome: string;
  tipo: TipoAtuador;
  estado: EstadoAtuador;
  potenciaKw: number;
  atualizadoEm: DataHoraIso;
  ligado: boolean;
}

export interface Falha {
  id: number;
  codigo: string;
  descricao: string;
  severidade: Severidade;
  origem: string;
  dataHora: DataHoraIso;
  resolvida: boolean;
  resolvidaEm: DataHoraIso | null;
}

export interface Limites {
  nivelMinimo: number;
  nivelMaximo: number;
  vazaoMaxima: number;
  consumoMaximo: number;
}

/** Resposta do GET /api/status. */
export interface StatusEstacao {
  dataHora: DataHoraIso;
  niveis: Leitura[];
  vazoes: Leitura[];
  consumos: Leitura[];
  consumoTotalKw: number;
  atuadores: Atuador[];
  falhasAbertas: number;
  ultimasFalhas: Falha[];
  limites?: Limites;
  capacidadesLitros?: Record<string, number>;
  simulacaoAtiva?: boolean;
}

/** Resposta do GET /api/leituras/ultima. */
export interface UltimaLeitura {
  dataHora: DataHoraIso | null;
  nivelReservatorioA: number | null;
  nivelReservatorioB: number | null;
  vazaoEntrada: number | null;
  vazaoSaida: number | null;
  potenciaTotalKw: number | null;
  simulacaoAtiva: boolean;
}

/** Limites padrão, usados apenas enquanto o backend ainda não respondeu. */
export const LIMITES_PADRAO: Limites = {
  nivelMinimo: 20,
  nivelMaximo: 95,
  vazaoMaxima: 120,
  consumoMaximo: 15,
};
