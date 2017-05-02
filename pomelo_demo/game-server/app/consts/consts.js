/**
 * Created by DELL on 2017/4/20.
 */
module.exports = {
    Event:{
        chat:'onChat',
        dealingCardOver:'dealingCardOver',
        singleGameOver:"singleGameOver",
        playerEnter:"onPlayerEnter",
        playerReady:"onPlayerReady",
        TSW:{
            onGameScoreChange:"tswGameScore"
        }
    },
    TSWGameStatus:{
        prepare : 0,
        setScore:1,
        bankerBuckleCard:2,
        playing:3
    }
}