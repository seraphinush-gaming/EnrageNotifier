// Version 1.13 r:01

const config = require('./config.json');

module.exports = function MsgEnrage(m) {

    // config
    let enable = config.enable,
        notice = config.notice;

    let boss = new Set(),
        enraged = false,
        hpCur = 0,
        hpMax = 0,
        hpPer = 0,
        inHH = false,
        nextEnrage = 0,
        timeout = null,
        timeoutCounter = null;

    // command
    m.command.add('enrage', {
        // toggle
        $none() {
            enable = !enable;
            send(`${enable ? 'Enabled' : 'Disabled'}`);
        },
        notice() {
            notice = !notice;
            send(`Notice to screen ${notice ? 'enabled': 'disabled'}`);
        },
        status() { showStatus(); },
        $default() {
            send(`Invalid argument. usage : enrage [notice|status]`)
        }
    });

    // mod.game
    m.game.me.on('change_zone', (zone, quick) => {
        (zone === 9950) ? inHH = true : inHH = false
        if (timeout !== 0 || timeoutCounter !== 0) { clearTimer(); }
    });

    m.game.me.on('leave_game', () => { clearTimer(); });

    // code
    m.hook('S_BOSS_GAGE_INFO', 3, (e) => {
        if (!enable || inHH) return
        boss.add(e.id.toString());
        hpMax = e.maxHp;
        hpCur = e.curHp;
        hpPer = Math.floor((hpCur / hpMax) * 100);
        nextEnrage = (hpPer > 10) ? (hpPer - 10) : 0;
    });

    m.hook('S_NPC_STATUS', 1, (e) => {
        if (!enable || inHH) return
        if (!boss.has(e.creature.toString())) return
        if (e.enraged === 1 && !enraged) {
            enraged = true;
            toChat(`Boss enraged`);
            timeout = setTimeout(timeRemaining, 26000);
        } else if (e.enraged === 0 && enraged) {
            if (hpPer === 100) return
            enraged = false;
            send(`Next enrage at ` + `${nextEnrage}` + `%`);
            clearTimer();
        }
    });

    m.hook('S_DESPAWN_NPC', 3, (e) => {
        if (!enable || inHH) return
        if (boss.has(e.gameId.toString())) {
            boss.delete(e.gameId.toString());
            clearTimer();
            enraged = false;
        }
    });

    // helper
    function clearTimer() {
        clearTimeout(timeout);
        timeout = null;
        clearTimeout(timeoutCounter);
        timeoutCounter = null;
    }

    function toChat(msg) {
        if (notice) m.send('S_DUNGEON_EVENT_MESSAGE', 1, {
            unk1: 31, // 42 blue shiny text, 31 normal Text
            unk2: 0,
            unk3: 27,
            message: msg
        });
        else send(msg);
    }

    function timeRemaining() {
        let i = 10;
        timeoutCounter = setInterval( () => {
            if (enraged && i > 0) {
                send(`Seconds remaining : ${i}`);
                i--;
            } else {
                clearInterval(timeoutCounter);
                timeoutCounter = null;
            }
        }, 990);
    }

    function send(msg) { m.command.message(`: ` + [...arguments].join('\n\t - ')); }

    function showStatus() { send(
        `Enrage message : ${enable ? 'Enabled' : 'Disabled'}`,
        `Notice to screen : ${notice ? 'Enabled' : 'Disabled'}`) ;
    }

}