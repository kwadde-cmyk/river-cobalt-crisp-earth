import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.3:0',
  releaseNotes: {
    en_US:
      'Clears the leftover “delete RPC user” task from 0.1.1. Scriptwerk only creates scriptwerk_xxxx.',
    de_DE:
      'Räumt die hängende Aufgabe „RPC-Nutzer löschen“ aus 0.1.1 weg. Scriptwerk legt nur noch scriptwerk_xxxx an.',
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
