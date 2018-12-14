'use strict';

const config = require('./config.json');

module.exports = function MsgEnrage(mod) {
    const cmd = mod.command || mod.require.command;

    // config
    let enable = config.enable,
        notice = config.notice;

    let boss = new Set(),
        enraged = false,
        enrageDuration = 0,
        hpCur = 0,
        hpMax = 0,
        hpPer = 0,
        inHH = false,
        nextEnrage = 0,
        nextEnragePer = 0,
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
        inHH = zone === 9950;
        if (zone === 9126) {
            enrageDuration = 0;
            nextEnragePer = 5;
        }
        else {
            enrageDuration = 27;
            nextEnragePer = 10;
        }
        if (timeout !== 0 || timeoutCounter !== 0) {
            clearTimer();
        }
    });

    mod.game.on('leave_game', () => {
        clearTimer();
    });

    // code
    mod.hook('S_BOSS_GAGE_INFO', 3, (e) => {
        if (!enable || inHH)
            return;
        boss.add(e.id.toString());
        hpMax = Number(e.maxHp);
        hpCur = Number(e.curHp);
        hpPer = Math.round((hpCur / hpMax) * 10000) / 100;
        nextEnrage = (hpPer > nextEnragePer) ? (hpPer - nextEnragePer) : 0;
    });

    mod.hook('S_NPC_STATUS', 1, (e) => {
        if (!enable || inHH)
            return;
        if (!boss.has(e.creature.toString()))
            return;
        if (e.enraged === 1 && !enraged) {
            enraged = true;
            toChat(`Boss enraged`);
            timeout = setTimeout(timeRemaining, enrageDuration * 1000);
        } else if (e.enraged === 0 && enraged) {
            if (hpPer === 100)
                return;
            enraged = false;
            nextEnrage = nextEnrage.toString();
            if (nextEnrage.length > 5)
                nextEnrage.slice(0,5);
            send(`Next enrage at ` + `${nextEnrage}` + `%.`);
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
        let i = 9;
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

    function showStatus() {
        send(
            `Enrage message : ${enable ? 'En' : 'Dis'}abled`,
            `Notice to screen : ${notice ? 'En' : 'Dis'}abled`
        );
    }

    function send(msg) { cmd.message(': ' + [...arguments].join('\n\t - ')); }

}