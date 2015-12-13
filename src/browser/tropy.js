'use strict';

const { EventEmitter } = require('events');
const { resolve } = require('path');
const { BrowserWindow } = require('electron');

const pkg = require('../../package');

const prop = Object.defineProperty;

module.exports = class Tropy extends EventEmitter {

  constructor(mode = process.env.NODE_ENV) {
    if (Tropy.instance) return Tropy.instance;

    super();
    Tropy.instance = this;

    prop(this, 'mode', { value: mode });

    prop(this, 'home', {
      value: resolve(__dirname, '..', '..')
    });
  }

  open() {
    if (!this.win) {
      this.win = new BrowserWindow({})
        .once('closed', () => { this.win = undefined; });

      this.win.loadURL(`file://${this.home}/static/index.html`);
    }

    return this;
  }

  get version() {
    return pkg.version;
  }
};
