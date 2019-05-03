<p align="center">
<a href="#">
<img src="https://github.com/seraphinush-gaming/pastebin/blob/master/logo_ttb_trans.png?raw=true" width="200" height="200" alt="tera-toolbox, logo by Foglio" />
</a>
</p>

# msg-enrage [![paypal](https://img.shields.io/badge/paypal-donate-333333.svg?colorA=253B80&colorB=333333)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=B7QQJZV9L5P2J&source=url) [![paypal.me](https://img.shields.io/badge/paypal.me-donate-333333.svg?colorA=169BD7&colorB=333333)](https://www.paypal.me/seraphinush)
tera-toolbox module to notify enrage information of bosses
```
Support seraph via paypal donations, thanks in advance !
```

## Auto-update guide
- Create a folder called `msg-enrage` in `tera-toolbox/mods` and download >> [`module.json`](https://raw.githubusercontent.com/seraphinush-gaming/msg-enrage/master/module.json) << (right-click this link and save link as..) into the folder

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

## Changelog
<details>

    1.16
    - Removed `tera-game-state` usage
    1.15
    - Added hot-reload support
    1.14
    - Updated for caali-proxy-nextgen
    1.13
    - Removed `Command` require()
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
