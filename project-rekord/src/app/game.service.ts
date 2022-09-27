import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Firestore, collectionData, collection, getFirestore, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import 'firebase/firestore';
import { Router } from '@angular/router';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CardDialogComponent } from './shared/card-dialog/card-dialog.component';
import { ExchangeComponent } from './shared/exchange/exchange.component';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  //Colors
  bgColors = ["#a7bed3","#c6e2e9","#f1ffc4","#ffcaaf","#dab894","#fddfdf","#fcf7de","#defde0","#def3fd","#f0defd","#FFDFBA","#558F97","#E6DFCC"];
  sessionColor:string= '';
  players: Array<any> = [];
  actualTurnPlayer:any = {};

  choosenMode:string = '';
  db = getFirestore();
  chosenMap:string = 'testMap';

  cameraPosition: [x: number, y: number, z: number] = [-5,5,-5];
  gameTable:any = {};
  gameMaps:any = [];
  cardsPositionCounter:number = 0;
  playersModel: any = {};
  pawnTypes: any = [];
  specialPawnTypes: any = [];
  specialPawn:String='';
  diceNumber:number|undefined;
  getCardPosition$ = new Subject();

  //CARD DIALOG
  cardInfoRef: MatDialogRef<any> | undefined;
  //EXCHANGE DIALOG
  exchangeRef: MatDialogRef<any> | undefined;

  turn:number= 0;

  constructor(private afs: AngularFirestore,public router: Router, public dialog: MatDialog) { }
 
  async retrieveDBData(){

    const getMaps = await getDocs(collection(this.db, "gameTables"));
    getMaps.forEach((doc) => {
      this.gameMaps.push(doc.id)
      
    });

    const gameTableRef = doc(this.db, "gameTables", this.chosenMap);
    this.gameTable  = await (await getDoc(gameTableRef)).data();

    const playersModelRef = doc(this.db, "playerModel", 'playerModel');
    this.playersModel = await (await getDoc(playersModelRef)).data();

    const pawnTypesRef = await getDocs(collection(this.db, "pawnTypes"));
    pawnTypesRef.forEach((doc) => {
      doc.data()['specialPawn'] ? this.specialPawnTypes.push(doc.data()):this.pawnTypes.push(doc.data());
    });
  }

  chooseSessionColor(){
    this.sessionColor = this.bgColors[Math.floor(Math.random()* this.bgColors.length)];
  }

  createPlayer(name:string, pawnIndex:number){
    const type = this.specialPawn != ''? 'special' : 'normal';
    const newPlayer = JSON.parse(JSON.stringify(this.playersModel));
    newPlayer.name = name;
    newPlayer.money = 1500;
    newPlayer.pawn.choosenPawnLabel = type == 'normal'? this.pawnTypes[pawnIndex].name : this.specialPawnTypes.find((pawn: { value: String; }) => pawn.value == this.specialPawn).name;
    newPlayer.pawn.choosenPawnValue =  type == 'normal'? this.pawnTypes[pawnIndex].value : this.specialPawnTypes.find((pawn: { value: String; }) => pawn.value == this.specialPawn).value;
    newPlayer.canDice = false;
    newPlayer.actualCard = 0;
    this.players.push(newPlayer);
    type == 'normal'? this.pawnTypes.splice(pawnIndex,1) : this.specialPawnTypes.splice(this.specialPawnTypes.findIndex((pawn: { name: String; }) => pawn.name == this.specialPawn),1); 
    this.specialPawn= '';
  }

  startGame(){
    this.router.navigateByUrl('game', { skipLocationChange: true })
    this.turn = Math.round(Math.random() * ((this.players.length - 1) - 0) + 0);
    this.actualTurnPlayer = this.players[this.turn];
    this.actualTurnPlayer.canDice = true;
    
  }

  nextTurn(){
    if(this.turn == (this.players.length - 1)){
      this.turn = 0;
    }else{
      this.turn++;
    }

    if(this.players[this.turn].bankrupt){
      this.turn++;
    }
    this.actualTurnPlayer = this.players[this.turn];
    this.actualTurnPlayer.canDice = true;
    this.diceNumber = undefined;
  }

  rollTheDice(){
    const num = Math.round(Math.random() * (12 - 1) + 1);
    this.diceNumber =( num + this.actualTurnPlayer.actualCard);
    if(this.diceNumber && this.diceNumber > this.gameTable.cards.length){
      this.diceNumber = 0 + ((num-((this.gameTable.cards.length - 1) - this.actualTurnPlayer.actualCard)) - 1);
    }
    this.actualTurnPlayer.actualCard = this.diceNumber;
    this.getCardPosition$.next(this.diceNumber);
    this.actualTurnPlayer.canDice = false;

  }
  payTaxes(cardIndex:number){
    if(this.gameTable.cards[cardIndex].owner){
      const amount = parseInt(this.calculateTaxesToPay(cardIndex));
      this.actualTurnPlayer.money -= amount;
      const playerToPay = this.players.find(player => player.name == this.gameTable.cards[cardIndex].owner).money +=amount;;
    }
  }
  calculateTaxesToPay(cardIndex:number){
    if(this.gameTable.cards[cardIndex].completedSeries){
      if(this.gameTable.cards[cardIndex].hotelCounter){
        this.gameTable.cards[cardIndex].rentCosts.hotel;
      }else if(this.gameTable.cards[cardIndex].housesCounter){
        switch(this.gameTable.cards[cardIndex].hotelCounter){
          case 1:
            return this.gameTable.cards[cardIndex].rentCosts.one;
          case 2:
            return this.gameTable.cards[cardIndex].rentCosts.two;
          case 3:
            return this.gameTable.cards[cardIndex].rentCosts.three;
          case 4:
            return this.gameTable.cards[cardIndex].rentCosts.four;
        }
      }else{
        return this.gameTable.cards[cardIndex].rentCosts.completedSeriesBasic;
      }
    }else if(!this.gameTable.cards[cardIndex].completedSeries){
      return this.gameTable.cards[cardIndex].rentCosts.normal;
    }
  }

  //MANAGE PROPERTIES
  buyProperty(property:any){
    this.actualTurnPlayer.money -= property.cost;
    property.canBuy = false;
    property.owner = this.players[this.turn].name;
    this.actualTurnPlayer.properties.push(JSON.parse(JSON.stringify(property)))
  }
  sellProperty(property:any){
    if(!property.distrained){
      this.actualTurnPlayer.money +=  property.cost - ((property.cost / 100) * 10);
    }else{
      this.actualTurnPlayer.money +=  property.distrainedCost - ((property.distrainedCost / 100) * 50);
    }
    property.canBuy = true;
    property.owner = "";

  }
  distrainProperty(property:any){
    property.distrained = true;
    this.actualTurnPlayer.money += property.distrainedCost;
  }
  cancelDistrainedFromProperty(property:any){
    property.distrained = false;
    this.actualTurnPlayer.money -= property.distrainedCost + ((property.distrainedCost / 100) * 20);
  }

  managePropertyHouses(action:string, propIndex:number, numHouses:number){
    if(action == 'Add'){
      this.gameTable.cards[propIndex].housesCounter += numHouses;
    }else if(action == 'Remove'){
      this.gameTable.cards[propIndex].housesCounter -= numHouses;
    }
  }

  //DIALOGS
  openCardDialog(card:object){
    this.cardInfoRef = this.dialog.open(CardDialogComponent, {
      width: '450px',
      panelClass: 'cardInfo',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        card: card,
      }
    });
  }
  openExchangeDialog(){
    this.cardInfoRef = this.dialog.open(ExchangeComponent, {
      width: '60%',
      height: '80%',
      panelClass: 'cardInfo',
      hasBackdrop: true,
      autoFocus: false,
      data: {
      }
    });
  }

  //BANKRUPT
  checkBankrupt(){
    if(!this.actualTurnPlayer.properties.length && this.actualTurnPlayer.money ==0){}
  }

  
  /////////////////DELETE
  async setDB(){
    let cardsData = [];
    for (let index = 0; index < 40; index++) {
      cardsData.push({
        canBuy: true,
        cost: 50,
        distrained: false,
        distrainedCost: 60,
        name: "Cella " + index,
        owner: "",
        exchangeSelected: false,
        completedSeries: false,
        rentCosts : {
          normal: '10',
          completedSeriesBasic:'20',
          one: '30',
          two: '80',
          three: '120',
          four:'200',
          hotel:'350'
        },
        housesCounter:0,
        hotelCounter:0,
        houseCost:50,
        hotelCost:50,
      })
    }
    await setDoc(doc(this.db, "gameTables", "testMap"), {cards: cardsData});

  }
}
