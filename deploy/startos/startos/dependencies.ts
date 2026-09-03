import { deleteRpcAuth, generateRpcUserDependent, RPC_USER } from './bitcoindRpc'
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

  /*
   * Core's generate-rpc-dependent refuses if username already exists (GUI
   * "Generate RPC User" stores only a hash — that password cannot be read
   * back). Delete our username first, then create it with the password we
   * persist in store.json. once:false so a failed 0.1.0 attempt retries.
   */
  try {
    await sdk.action.createTask(effects, 'bitcoind', deleteRpcAuth, 'critical', {
      input: {
        kind: 'partial',
        accept: [],
        set: { deletedRpcUsers: [RPC_USER] as [typeof RPC_USER] },
      },
      when: { condition: 'input-not-matches', once: true },
      reason: i18n('Remove the colliding RPC user so Scriptwerk can create its own'),
    })
  } catch {
    /* Bitcoin Core not installed yet — optional dependency. */
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
