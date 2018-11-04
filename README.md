# msg-enrage
tera-proxy module to notify enrage information of bosses

## Auto-update guide
- Create a folder called `msg-enrage` in `tera-proxy/bin/node_modules` and download [`module.json`](https://raw.githubusercontent.com/seraphinush-gaming/msg-enrage/master/module.json) (right-click save link as...) into the folder

## Dependency
- `command` module
- `tera-game-state` module

## Usage
- __`enrage`__
  - Toggle on/off
### Arguments
- __`notice`__
  - Toggle notice to screen on/off
- __`status`__
  - Send module status

## Config
- __`enable`__
  - Initialize module on/off
  - Default is `true`
- __`notice`__
  - Initialize notice to screen option on/off
  - Default is `false`

## Info
- Original author : [TeraProxy](https://github.com/TeraProxy)
- **Support seraph via paypal donations, thanks in advance : [paypal](https://www.paypal.me/seraphinush)**

## Changelog
<details>

    1.13
    - Removed `command` require()
    - Removed `tera-game-state` require()
    - Updated to `mod.command`
    - Updated to `mod.game`
    1.12
    - Removed font color bloat
    - Added `tera-game-state` dependency
    1.11
    - Added auto-update support
    - Refactored config file
    -- Added `enable`
    -- Added `notice`
    1.10
    - Personalized code aesthetics
    1.00
    - Initial fork

</details>
