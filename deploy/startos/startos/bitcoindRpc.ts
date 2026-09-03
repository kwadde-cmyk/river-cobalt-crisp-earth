import { i18n } from './i18n'
import { sdk } from './sdk'

const { InputSpec, Value } = sdk

/** Same id/input as bitcoin-core-startos `generate-rpc-dependent` (hidden there). */
export const generateRpcUserDependent = sdk.Action.withInput(
  'generate-rpc-dependent',
  async () => ({
    name: i18n('Create RPC Credentials'),
    description: i18n('RPC user for Scriptwerk on Bitcoin Core'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),
  InputSpec.of({
    username: Value.text({
      name: i18n('Username'),
      required: true,
      default: 'scriptwerk',
      patterns: [
        {
          regex: '^[a-zA-Z0-9_]+$',
          description: i18n('Alphanumeric'),
        },
      ],
    }),
    password: Value.text({
      name: i18n('Password'),
      required: true,
      default: null,
      masked: true,
      minLength: 20,
      patterns: [
        {
          regex: '^[A-Za-z0-9_-]+$',
          description: i18n('Alphanumeric'),
        },
      ],
    }),
  }),
  async () => {},
  async () => ({
    version: '1',
    title: '',
    message: '',
    result: null,
  }),
)

/** Same id/input as bitcoin-core-startos `delete-rpcauth`. */
export const deleteRpcAuth = sdk.Action.withInput(
  'delete-rpcauth',
  async () => ({
    name: i18n('Delete RPC Users'),
    description: i18n('Remove the colliding RPC user so Scriptwerk can create its own'),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'hidden',
  }),
  InputSpec.of({
    deletedRpcUsers: Value.multiselect({
      name: i18n('Existing RPC Users'),
      default: [],
      values: { scriptwerk: 'scriptwerk' },
    }),
  }),
  async () => {},
  async () => {},
)

export const RPC_USER = 'scriptwerk'
export const RPC_HOST_ID = 'rpc'
export const RPC_PORT = 8332
