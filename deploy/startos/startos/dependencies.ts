import { generateRpcUserDependent, RPC_USER } from './bitcoindRpc'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { randomRpcPassword } from './utils'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  let store = await storeJson.read().once()
  if (!store?.rpcPassword) {
    store = { rpcUser: RPC_USER, rpcPassword: randomRpcPassword() }
    await storeJson.write(effects, store)
  }

  try {
    await sdk.action.createTask(effects, 'bitcoind', generateRpcUserDependent, 'critical', {
      input: {
        kind: 'partial',
        accept: [{ username: store.rpcUser, password: store.rpcPassword }],
        set: { username: store.rpcUser, password: store.rpcPassword },
      },
      when: { condition: 'input-not-matches', once: true },
      reason: i18n('Scriptwerk needs an RPC user on Bitcoin Core'),
    })
  } catch {
    /* Bitcoin Core not installed yet — optional dependency. */
  }

  return {
    bitcoind: {
      kind: 'running',
      versionRange: '>=26.0.0',
      healthChecks: ['bitcoind'],
    },
  }
})
