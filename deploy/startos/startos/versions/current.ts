import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.6:0',
  releaseNotes: {
    en_US:
      'Unblocks start: the RPC-user task no longer stays critical after the user already exists. Existing unique credentials are reused; the task is issued only once for new creds.',
    de_DE:
      'Start wieder möglich: die RPC-User-Aufgabe bleibt nicht mehr als kritisch hängen, wenn der User schon angelegt ist. Vorhandene Zugangsdaten werden weiterverwendet.',
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
