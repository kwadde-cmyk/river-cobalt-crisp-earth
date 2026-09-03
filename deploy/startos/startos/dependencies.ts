import { generateRpcUserDependent } from './bitcoindRpc'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { isGeneratedRpcUser, randomRpcPassword, randomRpcUsername } from './utils'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  let store = await storeJson.read().once()
  const stale = !store?.rpcUser || !store.rpcPassword || !isGeneratedRpcUser(store.rpcUser)
  if (stale) {
    store = {
      rpcUser: randomRpcUsername(),
      rpcPassword: randomRpcPassword(),
    }
    await storeJson.write(effects, store)
  }
  const creds = store!

  try {
    await sdk.action.clearTask(effects, 'bitcoind:delete-rpcauth')
  } catch {
    /* no leftover delete task */
  }

  try {
    await sdk.action.createTask(effects, 'bitcoind', generateRpcUserDependent, 'critical', {
      input: {
        kind: 'partial',
        accept: [{ username: creds.rpcUser, password: creds.rpcPassword }],
        set: { username: creds.rpcUser, password: creds.rpcPassword },
      },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n('Scriptwerk needs an RPC user on Bitcoin Core'),
      replayId: 'scriptwerk-rpc-user',
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
