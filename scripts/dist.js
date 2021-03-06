'use strict'

require('shelljs/make')

const packager = require('electron-packager')
const log = require('./log')
const release = require('../lib/common/release')

const { join, resolve } = require('path')

const dir = resolve(__dirname, '..')
const res = join(dir, 'res')

const electron = require('electron/package')

target.all = () => {
  target.pack()
}

target.pack = (args = []) => {
  const tag = 'pack'

  const platform = args[0] || process.platform
  const arch = args[1] || process.arch

  const icon = platform === 'win32' ?
    join(res, 'icons', release.channel, `${release.name}.ico`) :
    join(res, 'icons', release.channel, `${release.name}.icns`)

  const out = join(dir, 'dist', release.channel)
  const build =
    exec('git describe --tags --long', { silent: true }).stdout.trim()

  packager({
    platform, arch, icon, out, dir,

    name: release.product,
    prune: true,
    overwrite: true,

    asar: {
      unpack: '**/*.node'
    },

    electronVersion: electron.version,
    buildVersion: build,
    appVersion: release.version,
    appBundleId: 'org.tropy.tropy',
    helperBundleId: 'org.tropy.tropy-helper',
    appCategoryType: 'public.app-category.productivity',
    appCopyright:
      `Copyright (c) 2015-${new Date().getFullYear()} ` +
      `${release.author.name}. All rights not expressly granted are reserved.`,

    extendInfo: join(res, 'ext.plist'),

    extraResource: [
      join(res, 'icons', 'mime', 'tpy.icns')
    ],

    ignore: [
      /.DS_Store/,
      /.babelrc/,
      /.eslintrc/,
      /.gitignore/,
      /.nvmrc/,
      /.sass-lint\.yml/,
      /.travis\.yml/,
      /.vimrc/,
      /^\/coverage/,
      /^\/db.test/,
      /^\/dist/,
      /^\/doc/,
      /^\/ext/,
      /^\/res.icons/,
      /^\/res.dmg/,
      /^\/res.ext\.plist/,
      /^\/scripts/,
      /^\/src/,
      /^\/test/,
      /^\/tmp/,
      /appveyor\.yml/
    ]

  }, (err, dst) => {
    if (err) return log.error(err)
    log.info(`saved to ${dst}`, { tag })

    switch (platform) {
      case 'linux':
        rename(String(dst), release.product, release.name)
        log.info('renamed executable', { tag })
        break
    }
  })
}


function rename(ctx, from, to) {
  mv(join(ctx, from), join(ctx, to))
}

exports.package = Object.assign({}, target)
