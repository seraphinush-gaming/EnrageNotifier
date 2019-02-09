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
        inHh = false,
        nextEnrage = 0,
        nextEnragePer = 10,
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
        'status': () => status(),
        '$default': () => send(`Invalid argument. usage : enrage [notice|status]`)
    });

    // game state
    mod.hook('S_LOAD_TOPO', 3, { order: -10 }, (e) => {
        inHh = e.zone === 9950;
        if (timeout !== 0 || timeoutCounter !== 0)
            clearTimer();
    });

    // code
    mod.hook('S_BOSS_GAGE_INFO', 3, (e) => {
        if (!enable || inHh)
            return;
        boss.add(e.id.toString());
        hpCur = Number(e.curHp);
        hpMax = Number(e.maxHp);
        hpPer = Math.round((hpCur / hpMax) * 10000) / 100;
        nextEnrage = (hpPer > nextEnragePer) ? (hpPer - nextEnragePer) : 0;
    });

    mod.hook('S_NPC_STATUS', 2, (e) => {
        if (!enable || inHh)
            return;
        if (!boss.has(e.gameId.toString()))
            return;
        if (e.enraged && !enraged) {
            enraged = true;
            enrageDuration = e.remainingEnrageTime - 10000;
            enrageDuration = (enrageDuration < 0) ? 0 : enrageDuration;
            toChat(`Boss enraged`);
            timeout = setTimeout(timeRemaining, enrageDuration);
        } else if (!e.enraged && enraged) {
            if (hpPer === 100)
                return;
            enraged = false;
            nextEnrage = nextEnrage.toString();
            if (nextEnrage.length > 5)
                nextEnrage.slice(0, 5);
            send(`Next enrage at ` + `${nextEnrage}` + `%.`);
            clearTimer();
        }
    });

    mod.hook('S_DESPAWN_NPC', 3, (e) => {
        if (!enable || inHh)
            return;
        if (boss.has(e.gameId.toString())) {
            boss.delete(e.gameId.toString());
            clearTimer();
            enraged = false;
            hpCur = 0;
            hpMax = 0;
            hpPer = 0;
        }
    });

    // helper
    function clearTimer() {
        clearTimeout(timeout);
        clearTimeout(timeoutCounter);
        timeout = null;
        timeoutCounter = null;
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

    function toChat(msg) {
        if (notice)
            mod.send('S_DUNGEON_EVENT_MESSAGE', 2, {
                type: 31, // 42 blue shiny text, 31 normal Text
                chat: false,
                channel: 27,
                message: msg
            });
        else
            send(msg);
    }

    function status() {
        send(
            `Enrage message : ${enable ? 'En' : 'Dis'}abled`,
            `Notice to screen : ${notice ? 'En' : 'Dis'}abled`
        );
    }

    function send(msg) { cmd.message(': ' + [...arguments].join('\n\t - ')); }

    // reload
    this.saveState = () => {
        let state = {
            enable: enable,
            notice: notice,
            boss: boss,
            enrageDuration: enrageDuration,
            inHh: inHh,
            nextEnragePer: nextEnragePer
        };
        return state;
    }

    this.loadState = (state) => {
        enable = state.enable;
        enable = state.notice;
        boss = state.boss;
        enrageDuration = state.enrageDuration;
        inHh = state.inHh;
        nextEnragePer = state.nextEnragePer;
    }

    this.destructor = () => {
        clearTimer();
        cmd.remove('enrage');
    }

}