import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.8:0',
  releaseNotes: {
    en_US:
      'Glowing-S site favicon. German copy: Ausgabepfad, Descriptor, ableitbar, Key-Wiederverwendung, Child-Keys.',
    de_DE:
      'Leuchtendes S als Website-Icon. Deutsche Texte: Ausgabepfad, Descriptor, ableitbar, Key-Wiederverwendung, Child-Keys.',
    es_ES:
      'Favicon S. Textos DE: Ausgabepfad, Descriptor, ableitbar, reutilización de claves.',
    pl_PL:
      'Favicon S. Niemieckie teksty: Ausgabepfad, Descriptor, ableitbar, ponowne użycie kluczy.',
    fr_FR:
      'Favicon S. Textes DE: Ausgabepfad, Descriptor, ableitbar, réutilisation des clés.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
