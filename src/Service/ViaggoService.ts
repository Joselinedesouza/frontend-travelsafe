const API_URL = import.meta.env.VITE_API_URL as string;

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

export async function registraViaggio(
  viaggio: ViaggioRegistratoDTO,
  token: string
): Promise<void> {

  const res = await fetch(`${API_URL}/api/viaggio`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(viaggio),

  });

  if (!res.ok) {

    let message = "Errore durante la registrazione del viaggio";

    try {

      const data = await res.json();

      message = data.message || message;

    } catch {

      // nel caso backend restituisca testo semplice

    }

    throw new Error(message);

  }

}