import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.1:0',
  releaseNotes: {
    en_US:
      'Fix Bitcoin Core RPC auth: Scriptwerk now uses its stored password (env wins over the form) and replaces a GUI-created scriptwerk user Core would otherwise refuse to overwrite.',
    de_DE:
      'RPC-Auth gegen Bitcoin Core: Scriptwerk nutzt das gespeicherte Passwort (Server vor Formular) und ersetzt einen in der Core-GUI angelegten Nutzer scriptwerk, den Core sonst nicht überschreibt.',
    es_ES:
      'Auth RPC: Scriptwerk usa su contraseña guardada (el servidor gana al formulario) y sustituye un usuario scriptwerk creado en la GUI de Core que Core no sobrescribe.',
    pl_PL:
      'Auth RPC: Scriptwerk używa zapisanego hasła (serwer przed formularzem) i zastępuje użytkownika scriptwerk z GUI Core, którego Core nie nadpisuje.',
    fr_FR:
      'Auth RPC : Scriptwerk utilise son mot de passe enregistré (le serveur prime sur le formulaire) et remplace un utilisateur scriptwerk créé dans l’interface Core que Core refuse d’écraser.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
