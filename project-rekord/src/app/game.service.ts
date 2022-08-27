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
  players: Array<any> = [];
  actualTurnPlayer:any = {};

  choosenMode:string = '';
  db = getFirestore();
  chosenMap:string = 'testMap';

  gameTable:any = {};
  playersModel: any = {};
  pawnTypes: any = [];
  diceNumber:number|undefined;


  turn:number= 0;

  constructor(private afs: AngularFirestore,public router: Router) { }
 
  async retrieveDBData(){
    const gameTableRef = doc(this.db, "gameTables", this.chosenMap);
    this.gameTable  = await (await getDoc(gameTableRef)).data();
    console.log(this.gameTable)
    const playersModelRef = doc(this.db, "playerModel", 'playerModel');
    this.playersModel = await (await getDoc(playersModelRef)).data();



    const pawnTypesRef = await getDocs(collection(this.db, "pawnTypes"));
    pawnTypesRef.forEach((doc) => {
      this.pawnTypes.push(doc.data())
    });
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
    console.log(property)
    const player = this.players.find(player => player.name == this.players[this.turn].name);
    player.money -= property.cost;
    property.canBuy = false;
    property.owner = this.players[this.turn].name;
    this.diceNumber = undefined;
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
