// Version 1.12 r:00

const Command = require('command')
const GameState = require('tera-game-state')

const config = require('./config.json')

module.exports = function MsgEnrage(d) {
    const command = Command(d)
    const game = GameState(d)

    // config
    let enable = config.enable,
        notice = config.notice

    let boss = new Set(),
        enraged = false,
        hpCur = 0,
        hpMax = 0,
        hpPer = 0,
        inHH = false,
        nextEnrage = 0,
        timeout = 0,
        timeoutCounter = 0

    // command
    command.add('enrage', (p) => {
        // toggle
        if (!p) { 
            enable = !enable
            send(`${enable ? 'Enabled' : 'Disabled'}`)
        }
        // notice 
        else if (p === 'n' || p === 'notice') {
            notice = !notice
            send(`Notice to screen ${notice ? 'enabled': 'disabled'}`)
        // status
        } else if (p === 's' || p === 'status') status()
        else send(`Invalid argument.`)
    })

    // code
    d.hook('S_LOAD_TOPO', 'raw', () => {
        (game.me.zone === 9950) ? inHH = true : inHH = false
        if (timeout !== 0) {
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = 0
            timeoutCounter = 0
        }
    })

    d.hook('S_BOSS_GAGE_INFO', 3, (e) => {
        if (!enable || inHH) return
        boss.add(e.id.toString())
        hpMax = e.maxHp
        hpCur = e.curHp
        hpPer = Math.floor((hpCur / hpMax) * 100)
        nextEnrage = (hpPer > 10) ? (hpPer - 10) : 0
    })

    d.hook('S_NPC_STATUS', 1, (e) => {
        if (!enable || inHH) return
        if (!boss.has(e.creature.toString())) return
        if (e.enraged === 1 && !enraged) {
            enraged = true
            toChat(`Boss enraged`)
            timeout = setTimeout(timeRemaining, 26000)
        } else if (e.enraged === 0 && enraged) {
            if (hpPer === 100) return
            enraged = false
            send(`Next enrage at ` + `${nextEnrage}` + `%`)
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = 0
            timeoutCounter = 0
        }
    })

    d.hook('S_DESPAWN_NPC', 3, (e) => {
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
                send(`Seconds remaining : ` + `${i}`)
                i--
            } else {
                clearInterval(timeoutCounter)
                timeoutCounter = -1
            }
        }, 990)
    }

    function send(msg) { command.message(`[msg-enrage] : ` + [...arguments].join('\n\t - ')) }

    function status() { send(
        `Enrage message : ${enable ? 'Enabled' : 'Disabled'}`,
        `Notice to screen : ${notice ? 'Enabled' : 'Disabled'}`) 
    }

}