// Version 1.11 r:04

const Command = require('command')
const config = require('./config.json')

// credit : https://github.com/Some-AV-Popo
String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }

module.exports = function MsgEnrage(d) {
    const command = Command(d)

    let enable = config.enable,
        notice = config.notice

    let boss = new Set(),
        enraged = false,
        hpMax = 0,
        hpCur = 0,
        hpPer = 0,
        inHH = false,
        nextEnrage = 0,
        timeout = 0,
        timeoutCounter = 0

    // code
    d.hook('S_LOAD_TOPO', (e) => {
        (e.zone === 9950) ? inHH = true : inHH = false
        if (timeout !== 0) {
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = 0
            timeoutCounter = 0
        }
    })

    d.hook('S_BOSS_GAGE_INFO', (e) => {
        if (!enable || inHH) return
        boss.add(e.id.toString())
        hpMax = e.maxHp
        hpCur = e.curHp
        hpPer = Math.floor((hpCur / hpMax) * 100)
        nextEnrage = (hpPer > 10) ? (hpPer - 10) : 0
    })

    d.hook('S_NPC_STATUS', (e) => {
        if (!enable || inHH) return
        if (!boss.has(e.creature.toString())) return
        if (e.enraged === 1 && !enraged) {
            enraged = true
            toChat(`Boss enraged`)
            timeout = setTimeout(timeRemaining, 26000)
        } else if (e.enraged === 0 && enraged) {
            if (hpPer === 100) return
            enraged = false
            send(`Next enrage at ` + `${nextEnrage}`.clr('FF0000') + `%`.clr('FFFFFF'))
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = 0
            timeoutCounter = 0
        }
    })

    d.hook('S_DESPAWN_NPC', (e) => {
        if (!enable || inHH) return
        if (boss.has(e.gameId.toString())) {
            boss.delete(e.gameId.toString())
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = 0
            timeoutCounter = 0
            enraged = false
        }
    })

    // helper
    function toChat(msg) {
        if (notice) d.send('S_DUNGEON_EVENT_MESSAGE', 1, {
            unk1: 31, // 42 blue shiny text, 31 normal Text
            unk2: 0,
            unk3: 27,
            message: msg
        })
        else send(msg)
    }

    function timeRemaining() {
        let i = 10
        timeoutCounter = setInterval( () => {
            if (enraged && i > 0) {
                send(`Time remaining : ` + `${i}`.clr('FF0000') + ` seconds`.clr('FFFFFF'))
                i--
            } else {
                clearInterval(timeoutCounter)
                timeoutCounter = -1
            }
        }, 1000)
    }

    // command
    command.add('enrage', (arg) => {
        // toggle
        if (!arg) { 
            enable = !enable
            send(`${enable ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')}`)
        }
        // notice 
        else if (arg === 'n' || arg === 'ㅜ' || arg === 'notice') {
            notice = !notice
            send(`Notice to screen ${notice ? 'enabled'.clr('56B4E9') : 'disabled'.clr('E69F00')}`)
        // status
        } else if (arg === 's' || arg === 'ㄴ' || arg === 'status') status()
        else send(`Invalid argument.`.clr('FF0000'))
    })
    function send(msg) { command.message(`[msg-enrage] : ` + [...arguments].join('\n\t - '.clr('FFFFFF'))) }
    function status() { send(
        `Enrage message : ${enable ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')}`,
        `Notice to screen : ${notice ? 'Enabled'.clr('56B4E9') : 'Disabled'.clr('E69F00')}`) 
    }

}