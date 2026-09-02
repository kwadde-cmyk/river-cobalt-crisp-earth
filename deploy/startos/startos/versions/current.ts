import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.0:0',
  releaseNotes: {
    en_US:
      'StartOS 0.4 package. Optional Bitcoin Core: GUI enables the dependency, RPC user scriptwerk is created, the studio connects without the bridge.',
    de_DE:
      'StartOS-0.4-Paket. Optionales Bitcoin Core: in der GUI einschalten, RPC-Nutzer scriptwerk wird angelegt, das Studio verbindet ohne Brücke.',
    es_ES:
      'Paquete StartOS 0.4. Bitcoin Core opcional: actívalo en la GUI, se crea el usuario RPC scriptwerk y el estudio conecta sin puente.',
    pl_PL:
      'Pakiet StartOS 0.4. Opcjonalny Bitcoin Core: włącz w GUI, powstaje użytkownik RPC scriptwerk, studio łączy się bez mostka.',
    fr_FR:
      'Paquet StartOS 0.4. Bitcoin Core optionnel : activez-le dans l’interface, l’utilisateur RPC scriptwerk est créé, le studio se connecte sans pont.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
