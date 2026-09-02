import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'scriptwerk',
  title: 'Scriptwerk',
  license: 'MIT',
  packageRepo: 'https://github.com/kwadde-cmyk/river-cobalt-crisp-earth',
  upstreamRepo: 'https://github.com/kwadde-cmyk/river-cobalt-crisp-earth',
  marketingUrl: 'https://github.com/kwadde-cmyk/river-cobalt-crisp-earth',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: {
        dockerBuild: {
          workdir: '../..',
          dockerfile: '../../Dockerfile',
        },
      },
      arch: ['x86_64'],
    },
  },
  dependencies: {
    bitcoind: {
      description:
        'Optional JSON-RPC for getdescriptorinfo. Scriptwerk creates the RPC user scriptwerk.',
      optional: true,
      metadata: {
        title: 'Bitcoin Core',
        icon: 'icon.svg',
      },
    },
  },
})
