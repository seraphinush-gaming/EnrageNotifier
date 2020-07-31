'use strict';

const PUPPY_FIGURINE = 206049;

class auto_feed_partner {

  constructor (mod) {

    this.mod = mod;
    this.command = mod.command;
    this.hook = null;

    // command
    mod.command.add('pet', {
      '$none': () => {
        mod.settings.enable = !mod.settings.enable;
        mod.settings.enable ? this.load() : this.unload();
        this.send(`${mod.settings.enable ? 'En' : 'Dis'}abled`); 
      },
    });

    mod.settings.enable ? this.load() : null;

  }

  destructor() {
    this.unload();
    this.command.remove('pet');
  }

  use_item(itemId) {
    this.mod.send('C_USE_ITEM', 3, {
      gameId: this.mod.game.me.gameId,
      id: itemId,
      amount: 1,
      unk4: true
    });
    this.send(`Attempted to feed Companion.`);
  }

  // code
  load() {
    this.hook = this.mod.hook('S_REQUEST_SPAWN_SERVANT', 4, (e) => {
      if (e.ownerId === this.mod.game.me.gameId) {
        (e.energyMax - e.energy) > 35 ? this.use_item(PUPPY_FIGURINE) : null;
      }
    });
  }

  unload() {
    this.mod.unhook(this.hook);
    this.hook = null;
  }

  send(msg) { this.command.message(': ' + msg); }

}

module.exports = { NetworkMod: auto_feed_partner };