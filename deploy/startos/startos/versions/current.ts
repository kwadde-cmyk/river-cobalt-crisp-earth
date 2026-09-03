import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.5:0',
  releaseNotes: {
    en_US:
      'Always creates a unique RPC user scriptwerk_xxxxxxxx with a fresh random password. Node dialog shows those credentials and locks them. Rebuild the full image (not only the wrapper).',
    de_DE:
      'Legt immer einen eindeutigen RPC-Nutzer scriptwerk_xxxxxxxx mit neuem Zufallspasswort an. Node-Dialog zeigt die Daten und sperrt sie. Komplettes Image neu bauen, nicht nur den Wrapper.',
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
