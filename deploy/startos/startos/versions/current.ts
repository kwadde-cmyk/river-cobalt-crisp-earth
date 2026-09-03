import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.1.7:0',
  releaseNotes: {
    en_US:
      'Per-key delete, StartOS RPC lock/reset, custom RPC when unlocked, glowing-S icon. USB no longer bulk-fills empty keys. Ledger/BitBox export without QR.',
    de_DE:
      'Löschen je Key, StartOS-RPC Sperren/Zurücksetzen, eigene RPC-Adresse wenn frei, leuchtendes S als Icon. USB füllt leere Keys nicht mehr. Ledger/BitBox-Export ohne QR.',
    es_ES:
      'Borrar cada clave, RPC StartOS con bloqueo/reset, RPC propia al desbloquear, icono S. Sin relleno USB masivo ni QR Ledger/BitBox.',
    pl_PL:
      'Usuwanie kluczy, blokada RPC StartOS, własny RPC po odblokowaniu, ikona S. Bez masowego wypełniania USB i QR Ledger/BitBox.',
    fr_FR:
      'Suppression par clé, verrou RPC StartOS, RPC perso une fois déverrouillé, icône S. Plus de remplissage USB ni de QR Ledger/BitBox.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
