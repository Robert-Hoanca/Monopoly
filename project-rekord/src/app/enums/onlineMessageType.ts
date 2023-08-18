export enum MessageTypes {
    CHANGE_TURN = "changeTurn",
    DICE_ROLL = "diceRoll",
    DICE_END = "diceEnd",
    CHANGE_MONEY = "changeMoney",
    CHANGE_PLAYER_POS = "changePlayerPos",
    OPEN_DIALOG = 'openDialog',
    DIALOG_ACTION = 'dialogAction',
}

export enum DialogTypes {
    CARD = "card",
    COMPLETED_SERIES = "completedSeries",
    EXCHANGE = "exchange",
    MESSAGE = "message",
    DICE_RES = "diceRes",
}

export enum DialogActionTypes {
    //Shared
    CLOSE = "close",

    //Card
    BUY_PROPERTY = "buyProperty",
    ADD_HOTEL = "addHotel",
    REMOVE_HOTEL = "removeHotel",
    ADD_HOUSE = "addHouse",
    REMOVE_HOUSE = "removeHouse",
    DISTRAIN_PROPERTY = "distrainProperty",
    CANCEL_DISTRAIN = "cancelDistrain",
    
    //Exchange
    SELECT_PLAYER = "selectPlayer",
    CHANGE_EXPANDED = "changeExpanded",
    START_EXCHANGE = "startExchange",
    BACK_TO_SELECTION = "backToSelection",
    FINALISE_EXCHANGE = "finaliseExchange"

}