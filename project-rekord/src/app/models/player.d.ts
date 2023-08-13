export interface playerModel {
    id:string = '',
    money:number = 0,
    name:string = '',
    actualCard:number = 0,
    canDice:boolean = false,
    bankrupt:boolean = false,
    pawn:Object<string, Array<number>> = {
        choosenPawnLabel:string = '',
        choosenPawnValue:string = '',
        position:Array<number> = [0,0,0],
        rotation:Array<number> = [0,0,0],
        scale:Array<number> = [0.05,0.05,0.05],
    },
    prison:Object<boolean, number> = {
        doubleDiceCounter:number = 0,
        getOutCards:number = 0,
        inPrison:boolean = false,
        inPrisonTurnCounter:number = 0,
    },
    canReceiveMoneyFromStart:boolean = true //TO DO CAMBIARE LABEL
    addingMoney:boolean = false,
    removingMoney:boolean = false
}