// OPCODE REQUIRED :
// - S_BOSS_GAGE_INFO
// - S_DESPAWN_NPC
// - S_DUNGEON_EVENT_MESSAGE
// - S_LOAD_TOPO
// - S_NPC_STATUS

// Version 1.10 r:02

module.exports = function MessageEnrage(d) {

    let enable = true,
        notice = false,
        inHH = false

    let boss = new Set(),
        enraged = false,
        hpMax = -1,
        hpCur = -1,
        hpPer = -1,
        nextEnrage = -1,
        timeout = -1,
        timeoutCounter = -1

    // code
    d.hook('S_LOAD_TOPO', (e) => {
        (e.zone === 9950) ? inHH = true : inHH = false
        if (timeout !== -1) {
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = -1
            timeoutCounter = -1
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
            timeout = -1
            timeoutCounter = -1
        }
    })

    d.hook('S_DESPAWN_NPC', (e) => {
        if (!enable || inHH) return
        if (boss.has(e.gameId.toString())) {
            boss.delete(e.gameId.toString())
            clearTimeout(timeout)
            clearTimeout(timeoutCounter)
            timeout = -1
            timeoutCounter = -1
            enraged = false
        }
    })

    // helper
    function toChat(msg) {
        if (notice) d.toClient('S_DUNGEON_EVENT_MESSAGE', {
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
                toChat(`Time remaining : ` + `${i}`.clr('FF0000') + ` seconds`.clr('FFFFFF'))
                i--
            } else {
                clearInterval(timeoutCounter)
                timeoutCounter = -1
            }
        }, 1000)
    }

    // command
    try {
        const Command = require('command')
        const command = Command(d)
        command.add('enrage', (arg) => {
            // toggle
            if (!arg) {
                enable = !enable
                status()
            // notice
            } else if (arg === 'notice') {
                notice = !notice
                send(`Notice to screen ${notice ? 'enabled'.clr('56B4E9') : 'disabled'.clr('E69F00')}` + `.`.clr('FFFFFF'))
            // status
            } else if (arg === 'status') status()
            else send(`Invalid argument.`.clr('FF0000'))
        })
        function send(msg) { command.message(`[message-enrage] : ` + [...arguments].join('\n\t - ')) }
        function status() { send(
            `Enrage message ${enable ? 'enabled'.clr('56B4E9') : 'disabled'.clr('E69F00')}` + `.`.clr('FFFFFF'),
            `Notice to screen : ${notice ? 'enabled' : 'disabled'}`) 
        }
    } catch (e) { console.log(`[ERROR] -- message-enrage module --`) }
    
}

// credit : https://github.com/Some-AV-Popo
String.prototype.clr = function (hexColor) { return `<font color="#${hexColor}">${this}</font>` }
