import { generateRpcUserDependent } from './bitcoindRpc'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { randomRpcPassword, randomRpcUsername } from './utils'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  let store = await storeJson.read().once()
  const needsUser = !store?.rpcUser || store.rpcUser === 'scriptwerk'
  if (!store?.rpcPassword || needsUser) {
    store = {
      rpcUser: needsUser ? randomRpcUsername() : store!.rpcUser,
      rpcPassword: store?.rpcPassword || randomRpcPassword(),
    }
    await storeJson.write(effects, store)
  }

  try {
    await sdk.action.clearTask(effects, 'bitcoind:delete-rpcauth')
  } catch {
    /* no leftover delete task */
  }

  try {
    await sdk.action.createTask(effects, 'bitcoind', generateRpcUserDependent, 'critical', {
      input: {
        kind: 'partial',
        accept: [{ username: store.rpcUser, password: store.rpcPassword }],
        set: { username: store.rpcUser, password: store.rpcPassword },
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
