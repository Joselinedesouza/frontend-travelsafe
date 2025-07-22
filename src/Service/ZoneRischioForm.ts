export type DangerLevel = "BASSO" | "MEDIO" | "ALTO";

export type Citta = {
  nome: string;
};

export type ZoneRischioForm = {
  id?: number;
  nome: string;
  descrizione: string;
  latitudine: number;
  longitudine: number;
  livelloPericolo: DangerLevel;
  nomeCitta?: string;
  citta?: { nome: string };
};