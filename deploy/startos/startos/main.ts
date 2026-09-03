import { RPC_HOST_ID, RPC_PORT } from './bitcoindRpc'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Scriptwerk'))

  const store = await storeJson.read().once()
  const rpcAddr = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: RPC_HOST_ID,
      internalPort: RPC_PORT,
    })
    .once()

  const env: Record<string, string> = { SCRIPTWERK_BUILD: '0.1.8' }
  if (rpcAddr && store?.rpcUser && store.rpcPassword) {
    env.BITCOIND_RPC_URL = `http://${rpcAddr}`
    env.BITCOIND_RPC_USER = store.rpcUser
    env.BITCOIND_RPC_PASSWORD = store.rpcPassword
    env.BITCOIND_RPC_SOURCE = 'startos'
  }

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      }),
      'scriptwerk-ui',
    ),
    exec: { command: ['node', 'scripts/host.mjs'], env },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
