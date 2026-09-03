import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.4:0',
  releaseNotes: {
    en_US:
      'Node dialog fills StartOS RPC URL, user and password and locks them behind a switch.',
    de_DE:
      'Node-Dialog übernimmt StartOS-RPC-Adresse, Nutzer und Passwort und sperrt die Felder per Schalter.',
    es_ES:
      'El usuario RPC pasa a ser único scriptwerk_xxxx. Sin tarea de borrado; borra usuarios de la GUI en Bitcoin Core si quieres.',
    pl_PL:
      'Użytkownik RPC to unikalne scriptwerk_xxxx. Bez zadania usuwania; starych użytkowników GUI usuń w Bitcoin Core.',
    fr_FR:
      'L’utilisateur RPC est unique scriptwerk_xxxx. Plus de tâche de suppression ; retirez les comptes GUI dans Bitcoin Core si besoin.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
