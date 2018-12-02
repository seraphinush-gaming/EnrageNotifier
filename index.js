// Version 1.13 r:05
'use strict';

const config = require('./config.json');

module.exports = function MsgEnrage(mod) {
    const cmd = mod.command || mod.require.command;

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
    cmd.add('enrage', {
        // toggle
        '$none': () => {
            enable = !enable;
            send(`${enable ? 'En' : 'Dis'}abled`);
        },
        'notice': () => {
            notice = !notice;
            send(`Notice to screen ${notice ? 'en' : 'dis'}abled`);
        },
        'status': () => {
            showStatus();
        },
        '$default': () => {
            send(`Invalid argument. usage : enrage [notice|status]`);
        }
    });

    // mod.game
    mod.game.me.on('change_zone', (zone) => {
        inHH = zone === 9950
        if (timeout !== 0 || timeoutCounter !== 0) {
            clearTimer();
        }
    });

    mod.game.on('leave_game', () => { clearTimer(); });

    // code
    mod.hook('S_BOSS_GAGE_INFO', 3, (e) => {
        if (!enable || inHH) return;
        boss.add(e.id.toString());
        hpMax = Number(e.maxHp);
        hpCur = Number(e.curHp);
        hpPer = Math.round((hpCur / hpMax) * 100) / 100;
        nextEnrage = (hpPer > 10) ? (hpPer - 10) : 0;
    });

    mod.hook('S_NPC_STATUS', 1, (e) => {
        if (!enable || inHH)
            return;
        if (!boss.has(e.creature.toString()))
            return;
        if (e.enraged === 1 && !enraged) {
            enraged = true;
            toChat(`Boss enraged`);
            timeout = setTimeout(timeRemaining, 26000);
        } else if (e.enraged === 0 && enraged) {
            if (hpPer === 100)
                return;
            enraged = false;
            send(`Next enrage at ` + `${nextEnrage}` + `%`);
            clearTimer();
        }
    });

    mod.hook('S_DESPAWN_NPC', 3, (e) => {
        if (!enable || inHH)
            return;
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
        if (notice) mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
            type: 31, // 42 blue shiny text, 31 normal Text
            chat: false,
            channel: 27,
            message: msg
        });
        else {
            send(msg);
        }
    }

    function timeRemaining() {
        let i = 10;
        timeoutCounter = setInterval(() => {
            if (enraged && i > 0) {
                send(`Seconds remaining : ${i}`);
                i--;
            } else {
                clearInterval(timeoutCounter);
                timeoutCounter = null;
            }
        }, 990);
    }

    function send(msg) { cmd.message(`: ` + [...arguments].join('\n\t - ')); }

    function showStatus() {
        send(
            `Enrage message : ${enable ? 'En' : 'Dis'}abled`,
            `Notice to screen : ${notice ? 'En' : 'Dis'}abled`
        );
    }

}