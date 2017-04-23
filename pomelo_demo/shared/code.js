/**
 * Created by DELL on 2017/3/16.
 */
module.exports = {
    OK: 200,
    FAIL: 500,
    USER:{
        NO_USER : 3001,
        USER_EXIST:3002,
        CREATE_USER_FAIL:3003
    },
    ENTRY: {
        FA_TOKEN_INVALID: 	1001,
        FA_TOKEN_EXPIRE: 	1002,
        FA_USER_NOT_EXIST: 	1003,
        FA_TOKEN_ILLEGAL:1004
    },
    ROOM:{
        ROOM_IS_NOT_EXIT:5001,
    },
    GAME:{
        SEND_POKE_Fail: 4001,
        SEND_POKE_Error_Sequence: 4002,
        GAME_IS_START:4003,
        NO_THIS_POS:4004,
        POS_HAS_PLAYER:4005,
        ROOM_IS_NOT_EXIT:4006,
        BE_READY_ERROR:4007,
        SET_SCORE_ERROR:4008
    },
    Chat:{
        FA_UNKNOW_CONNECTOR:6001,
        FA_CHANNEL_CREATE:6002
    },
    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    }
};