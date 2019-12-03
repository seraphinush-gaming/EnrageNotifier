'use strict';

const DefaultSettings = {
  "enable": true,
  "countdown": true,
  "notice": false
};

function MigrateSettings(from_ver, to_ver, settings) {
  if (from_ver === undefined) {
    return Object.assign(Object.assign({}, DefaultSettings), settings);
  } else if (from_ver === null) {
    return DefaultSettings;
  } else {
    if (from_ver + 1 < to_ver) {
      settings = MigrateSettings(from_ver, from_ver + 1, settings);
      return MigrateSettings(from_ver + 1, to_ver, settings);
    }
  
    switch (to_ver) {
      case 2:
        settings.countdown = true;
    }

    return settings;
  }
}

module.exports = MigrateSettings;