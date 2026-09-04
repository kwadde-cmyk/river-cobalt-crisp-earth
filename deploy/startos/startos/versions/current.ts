import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.9:0',
  releaseNotes: {
    en_US:
      'File export/import round-trips key display names (NANO-S etc.) via JSON, keys.txt, and comments on descriptor/BSMS.',
    de_DE:
      'Datei-Export/Import nimmt Key-Namen (NANO-S usw.) mit: JSON, keys.txt und Kommentare in Descriptor/BSMS.',
    es_ES:
      'Exportación e importación de archivos conservan los nombres de las claves.',
    pl_PL:
      'Eksport i import plików zachowuje nazwy kluczy.',
    fr_FR:
      'Export/import fichiers conserve les noms des clés.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
