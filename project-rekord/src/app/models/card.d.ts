export interface cardModel {
    //Shared
    index:number = 0,
    cardType:string = '',
    name:string = '',

    //Start
    reward?:number = 0,

    //Property - Plant - Station
    canBuy?:boolean = false,
    completedSeries?:boolean = false,
    cost?:number = 0,
    distrained?:boolean = false,
    distrainedCost?:number = 0,
    district?:string = '',
    exchangeSelected?:boolean = false,
    hotelCost?:number = 0,
    hotelCounter?:number = 0,
    houseCost?:number = 0,
    housesCounter?:number = 0,
    owner?:string = '',
    rentCosts?:Object<number> = {
        normal?:number = 0,
        completedSeriesBasic?:number = 0,
        one:number = 0,
        two:number = 0,
        three:number = 0,
        four:number = 0,
        hotel?:number = 0,
    }

    //Taxes
    taxesCost?:number = 0,
}