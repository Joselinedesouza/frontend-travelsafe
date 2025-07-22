export type ViaggioRegistratoDTO = {
  nome: string;
  cognome: string;
  email?: string;
  cittaPartenza: string;
  motivoViaggio: string;
  numeroResidenza: string;
  prefissoResidenza: string;
  dataNascita: string;
  statoNascita: string;
  paeseNascita: string;
  nomeStrutturaAlloggio: string;
  numeroEmergenza: string;
  latitudine?: number;
  longitudine?: number;
};

export async function registraViaggio(viaggio: ViaggioRegistratoDTO, token: string): Promise<void> {
  const res = await fetch("/api/viaggio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(viaggio),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Errore durante la registrazione del viaggio");
  }
}
