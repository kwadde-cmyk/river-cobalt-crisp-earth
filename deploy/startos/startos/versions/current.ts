import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.2:0',
  releaseNotes: {
    en_US:
      'RPC user is now a unique scriptwerk_xxxx (Core usernames cannot contain a hyphen). No delete-user task; remove leftover GUI users in Bitcoin Core if you want.',
    de_DE:
      'RPC-Nutzer ist jetzt eindeutig scriptwerk_xxxx (Core erlaubt kein Minus im Namen). Kein Lösch-Task mehr; alte GUI-User in Bitcoin Core selbst entfernen.',
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
