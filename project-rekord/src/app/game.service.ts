import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Firestore, collectionData, collection, getFirestore, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import 'firebase/firestore';
import { Router } from '@angular/router';
import { FlexAlignStyleBuilder } from '@angular/flex-layout';

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

  gameTable:any = {};
  cardsPositionCounter:number = 0;
  playersModel: any = {};
  pawnTypes: any = [];
  diceNumber:number|undefined;


  turn:number= 0;

  constructor(private afs: AngularFirestore,public router: Router) { }
 
  async retrieveDBData(){
    const gameTableRef = doc(this.db, "gameTables", this.chosenMap);
    this.gameTable  = await (await getDoc(gameTableRef)).data();
    const playersModelRef = doc(this.db, "playerModel", 'playerModel');
    this.playersModel = await (await getDoc(playersModelRef)).data();
    const pawnTypesRef = await getDocs(collection(this.db, "pawnTypes"));
    pawnTypesRef.forEach((doc) => {
      this.pawnTypes.push(doc.data())
    });
  }

  chooseSessionColor(){
    this.sessionColor = this.bgColors[Math.floor(Math.random()* this.bgColors.length)];
  }

  createPlayer(name:string, pawnIndex:number){
    this.players.push({
      name: name,
      money: 1500,
      choosenPawn: this.pawnTypes[pawnIndex].name,
      canDice: false,
      actualCard: 0,
      properties: {
        houses: 0,
        hotels: 0,
      },
    })

    this.pawnTypes.splice(pawnIndex,1)
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
    this.actualTurnPlayer.canDice = false;

  }
 /* rollTheDiceInitGame(){
    let diceNum = 0;
    this.players.forEach(player => {
      diceNum = Math.round(Math.random() * (12 - 1) + 1);
    });
  }*/

  buyProperty(property:any){
    this.actualTurnPlayer.money -= property.cost;
    property.canBuy = false;
    property.owner = this.players[this.turn].name;
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
      })
    }
    await setDoc(doc(this.db, "gameTables", "testMap"), {cards: cardsData});

  }
}
