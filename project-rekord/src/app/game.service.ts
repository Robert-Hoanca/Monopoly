import { Injectable } from '@angular/core';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Firestore, collectionData, collection, getFirestore, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import 'firebase/firestore';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CardDialogComponent } from './shared/card-dialog/card-dialog.component';
import { ExchangeComponent } from './shared/exchange/exchange.component';
import * as uuid from 'uuid';
import gsap from 'gsap'
import { Vector3 } from 'three';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  //Colors
  bgColors = ["#a7bed3","#c6e2e9","#f1ffc4","#ffcaaf","#dab894","#fddfdf","#fcf7de","#defde0","#def3fd","#f0defd","#FFDFBA","#558F97","#E6DFCC"];
  sessionColor:string= '';
  players: Array<any> = [];
  actualTurnPlayer:any = {};
  ambientLightColor:string='#ff8326'

  choosenMode:string = '';
  db = getFirestore();
  chosenMap:string = 'monopolyMap';

  //Camera
  camera:any;
  cameraPosition: Vector3 | any;


  gameTable:any = {};
  gameMaps:any = [];
  cardsPositionCounter:number = 0;
  playersModel: any = {};
  pawnTypes: any = [];
  specialPawnTypes: any = [];
  specialPawn:String='';
  diceNumber:number|undefined;
  getCardPosition$ = new Subject();

  //DIALOGS
  cardInfoRef: MatDialogRef<any> | undefined;
  exchangeRef: MatDialogRef<any> | undefined;

  turn:number= 0;


  setted:boolean=false;

  constructor(private afs: AngularFirestore,public router: Router, public dialog: MatDialog) { }
 
  async retrieveDBData(){

    const getMaps = await getDocs(collection(this.db, "gameTables"));
    getMaps.forEach((doc) => {
      this.gameMaps.push(doc.id)
    });

    const playersModelRef = doc(this.db, "playerModel", 'playerModel');
    this.playersModel = await (await getDoc(playersModelRef)).data();

    const pawnTypesRef = await getDocs(collection(this.db, "pawnTypes"));
    pawnTypesRef.forEach((doc) => {
      doc.data()['specialPawn'] ? this.specialPawnTypes.push(doc.data()):this.pawnTypes.push(doc.data());
    });

    this.cameraPosition = new THREE.Vector3()
  }

  chooseSessionColor(){
    this.sessionColor = this.bgColors[Math.floor(Math.random()* this.bgColors.length)];
  }

  createPlayer(name:string, pawnIndex:number){
    const type = this.specialPawn != ''? 'special' : 'normal';
    const newPlayer = JSON.parse(JSON.stringify(this.playersModel));
    newPlayer.name = name;
    newPlayer.id = uuid.v4();
    newPlayer.money = 1500;
    newPlayer.pawn.choosenPawnLabel = type == 'normal'? this.pawnTypes[pawnIndex].name : this.specialPawnTypes.find((pawn: { value: String; }) => pawn.value == this.specialPawn).name;
    newPlayer.pawn.choosenPawnValue =  type == 'normal'? this.pawnTypes[pawnIndex].value : this.specialPawnTypes.find((pawn: { value: String; }) => pawn.value == this.specialPawn).value;
    newPlayer.canDice = false;
    newPlayer.actualCard = 0;
    this.players.push(newPlayer);
    type == 'normal'? this.pawnTypes.splice(pawnIndex,1) : this.specialPawnTypes.splice(this.specialPawnTypes.findIndex((pawn: { name: String; }) => pawn.name == this.specialPawn),1); 
    this.specialPawn= '';
  }

  setCameraPosition(camera:any,x:number, y:number,z:number, duration:number){
    console.log(camera)
   setTimeout(() => {
    gsap.fromTo(camera._objRef.position, {x: camera._objRef.position.x}, {x: -5, duration: duration});
    gsap.fromTo(camera._objRef.position, {y: camera._objRef.position.y}, {y: 5, duration: duration});
    gsap.fromTo(camera._objRef.position, {z: camera._objRef.position.z}, {z: -5, duration: duration});
   }, 0);
  }

  setPlayerPosition(cardPosition:Array<number>){
    this.actualTurnPlayer.pawn.position =  cardPosition;
  }

  async startGame(){
    const gameTableRef = doc(this.db, "gameTables", this.chosenMap);
    this.gameTable  = (await getDoc(gameTableRef)).data();

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
    //this.setCameraPosition(this.camera, this.actualTurnPlayer.pawn.position[0],this.actualTurnPlayer.pawn.position[1],this.actualTurnPlayer.pawn.position[2], 5)
  }
  rollTheDice(){
    if(!this.actualTurnPlayer.prison.inPrison){
      const diceRes = this.getDiceRoll();
      if(diceRes[0]==diceRes[1]){
        this.actualTurnPlayer.prison.doubleDiceCounter++;
      }else{
        this.actualTurnPlayer.prison.doubleDiceCounter=0;
      }
      this.diceNumber =( (diceRes[0]+diceRes[1]) + this.actualTurnPlayer.actualCard);
      if(this.diceNumber && this.diceNumber > (this.gameTable.cards.length - 1)){
        this.diceNumber = 0 + (((diceRes[0]+diceRes[1])-((this.gameTable.cards.length - 1) - this.actualTurnPlayer.actualCard)) - 1);
      }
      this.checkIfHasPassedStart(this.actualTurnPlayer.actualCard, this.diceNumber);
      this.actualTurnPlayer.actualCard = this.diceNumber;
      this.getCardPosition$.next(this.diceNumber);
      this.actualTurnPlayer.canDice = false;
      this.whichPropertyAmI(this.gameTable.cards[(this.actualTurnPlayer.actualCard)])
      this.payTaxes(this.gameTable.cards[(this.actualTurnPlayer.actualCard)],diceRes);
    }else{
     this.whatToDoInprison('prisonRoll')
    }
  }

  getDiceRoll(){
    //ADD doubleDiceCounter COLORING TO THE DICE
    const dice1 = Math.round(Math.random() * (6 - 1) + 1);
    const dice2 = Math.round(Math.random() * (6 - 1) + 1);
    return [dice1,dice2];
  }

  whatToDoInprison(action:string){
    if(action == 'payToExit'){
      this.exitFromPrison(true, false);
    }else if(action == 'prisonRoll'){
      const diceRes = this.getDiceRoll();
      if(diceRes[0] == diceRes[1]){
        this.exitFromPrison(false, true,diceRes[0],diceRes[1]);
        
      }else if(this.actualTurnPlayer.prison.inPrisonTurnCounter == 2){
        this.exitFromPrison(true, true,diceRes[0],diceRes[1]);
      }else{
        this.actualTurnPlayer.prison.inPrisonTurnCounter++;
      }
      this.actualTurnPlayer.canDice = false;
      this.nextTurn();
    }
  }

  exitFromPrison(shouldPay:boolean, exitFromDice:boolean, dice1?:number, dice2?:number){
    if(shouldPay){
      this.actualTurnPlayer.money-=50;
      this.checkBankrupt(this.actualTurnPlayer,50);
    }
    if(exitFromDice && dice1 && dice2){
      this.actualTurnPlayer.actualCard += (dice1+dice2);
      this.getCardPosition$.next(this.actualTurnPlayer.actualCard);
    }
    this.actualTurnPlayer.prison.inPrison=false;
    this.actualTurnPlayer.prison.doubleDiceCounter=0;
    this.actualTurnPlayer.prison.inPrisonTurnCounter=0;
  }

  payTaxes(property:any, diceNumber:Array<number>){
    if(property.owner && property.owner!=this.actualTurnPlayer.id){
      const amount = this.calculateTaxesToPay(property,diceNumber);
      this.actualTurnPlayer.money -= amount;
      this.checkBankrupt(this.actualTurnPlayer,amount);
      this.players.find(player => player.id == property.owner).money +=amount;
    }
  }
  calculateTaxesToPay(property:any, diceNumber:Array<number>){
    if(property.cardType == 'property'){
      if(property.completedSeries){
        if(property.hotelCounter){
          return property.rentCosts.hotel;
        }else if(property.housesCounter){
          switch(property.housesCounter){
            case 1:
              return property.rentCosts.one;
            case 2:
              return property.rentCosts.two;
            case 3:
              return property.rentCosts.three;
            case 4:
              return property.rentCosts.four;
          }
        }else{
          return property.rentCosts.completedSeriesBasic;
        }
      }else if(!property.completedSeries){
        return property.rentCosts.normal;
      }
    }else if(property.cardType == 'station'){
      const numOfStations = this.gameTable.cards.filter((prop: { owner: any; cardType: any; }) => prop.owner == property.owner && prop.cardType == 'station').length; 
      switch(numOfStations){
        case 1:
          return property.rentCosts.one;
        case 2:
          return property.rentCosts.two;
        case 3:
          return property.rentCosts.three;
        case 4:
          return property.rentCosts.four;
      }
    }else if(property.cardType == 'plant'){
      const numOfPlants = this.gameTable.cards.filter((prop: { owner: any; cardType: any; }) => prop.owner == property.owner && prop.cardType == 'plant').length;
      switch(numOfPlants){
        case 1:
          return ((diceNumber[0] + diceNumber[1]) *4);
        case 2:
          return ((diceNumber[0] + diceNumber[1]) * 10);
      }
    }
  }

  whichPropertyAmI(property:any){
    if(property.cardType == 'goToPrison' || this.actualTurnPlayer.prison.doubleDiceCounter == 3){
      alert("going to prison")
      this.actualTurnPlayer.prison.inPrison = true;
      this.actualTurnPlayer.actualCard = 10;
      this.getCardPosition$.next(10);
      this.actualTurnPlayer.canDice=false;
      this.nextTurn()
    }else if(property.cardType == 'taxes'){
      this.actualTurnPlayer.money-= property.taxesCost;
    this.checkBankrupt(this.actualTurnPlayer,50);
    }else if(property.cardType == 'chance'){

    }else if(property.cardType == 'chest'){

    }
  }

  //MANAGE PROPERTIES
  buyProperty(property:any){
    this.actualTurnPlayer.money -= property.cost;
    property.canBuy = false;
    property.owner = this.players[this.turn].id;
    if(!property.completedSeries){
      this.checkCompletedSeries(property);
    }
  }
  sellProperty(property:any){
    if(!property.distrained){
      this.actualTurnPlayer.money +=  property.cost - ((property.cost / 100) * 10);
    }else{
      this.actualTurnPlayer.money +=  property.distrainedCost - ((property.distrainedCost / 100) * 50);
    }
    this.checkCompletedSeries(property);
    property.canBuy = true;
    property.owner = "";
  }
  distrainProperty(property:any){
    property.distrained = true;
    this.actualTurnPlayer.money += property.distrainedCost;
    this.checkCompletedSeries(property);
  }
  cancelDistrainedFromProperty(property:any){
    property.distrained = false;
    this.actualTurnPlayer.money -= property.distrainedCost + ((property.distrainedCost / 100) * 20);
    this.checkCompletedSeries(property);
  }
  checkCompletedSeries(property:any){
    const groupCards = this.gameTable.cards.filter((card: { district: any; }) => card.district == property.district) //ALL CARDS
    const ownerCards = groupCards.filter((card: { owner: any; }) => card.owner == this.actualTurnPlayer.id)
    if(groupCards.length == ownerCards.length && ownerCards.findIndex((cardI: { distrained: any; }) => cardI.distrained)<0){
      groupCards.forEach((card: { completedSeries: boolean; }) => {
        if(!card.completedSeries){  card.completedSeries = true;}
      });
    }else{
      groupCards.forEach((card: { completedSeries: boolean; }) => {
        if(card.completedSeries){  card.completedSeries = false;}
      });
    }
  }

  checkIfHasPassedStart(beforeMove:number, afterMove:number|undefined){
    if(afterMove && (afterMove < beforeMove)){
      this.actualTurnPlayer.money+=200;
    }
  }
  //DIALOGS
  openCardDialog(card:object){
    this.cardInfoRef = this.dialog.open(CardDialogComponent, {
      width: '450px',
      panelClass: 'propertyInfo',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        card: card,
      }
    });
  }
  openExchangeDialog(){
    this.cardInfoRef = this.dialog.open(ExchangeComponent, {
      panelClass: 'exchangePanel',
      hasBackdrop: true,
      autoFocus: false,
      data: {
      }
    });
  }

  //BANKRUPT
  checkBankrupt(player:any, moneyToSub:number){
    const playerProps= this.gameTable.cards.filter((card: { owner: any; })=>card.owner == player.id);
    let moneyFromDistrain = 0;

    if((player.money - moneyToSub)<0 && playerProps.length<1){
      alert(player.name + " has made bankrupt 1")
    }else if(playerProps.length && (player.money - moneyToSub)<0){
      //check if player can pay the debt
      playerProps.forEach((prop: { distrained: any; distrainedCost: number; }) => {
        if(!prop.distrained){
          moneyFromDistrain+=prop.distrainedCost;
        }
      });
      if(((player.money - moneyToSub) + moneyFromDistrain)<0){
        alert(player.name + " has made bankrupt 2")
      }
    }
  }

  
  /////////////////DELETE
  async setDB(){
    let cardsData = [];
    for (let index = 0; index < 40; index++) {

      //NORMAL PROPERTIES
      if(index != 0 && index !=2 && index != 4 && index != 5 && index != 7 && index != 10 &&
        index != 12 &&index != 15 &&index != 17 &&index != 20 && index != 22 &&index != 25 &&index != 28 &&
        index != 30 &&index != 33 &&index != 35 &&index != 36 && index != 38){
          cardsData.push({
            canBuy: true,
            cost: 50,
            distrained: false,
            distrainedCost: 60,
            name: '',
            owner: '',
            cardType:'property',
            exchangeSelected: false,
            completedSeries: false,
            district:'',
            rentCosts : {
              normal: 10,
              completedSeriesBasic: 20,
              one: 30,
              two: 80,
              three: 120,
              four: 200,
              hotel: 350
            },
            housesCounter:0,
            hotelCounter:0,
            houseCost:50,
            hotelCost:50,
          })
      }else if(index == 7 || index == 22 || index == 36){//CHANCE
        cardsData.push({
          canBuy: false,
          distrained: false,
          name: "Chance",
          cardType:'chance',
          chances : [

          ],
        })
      }else if(index == 2 || index == 17 || index == 33){//CHESTS
        cardsData.push({
          canBuy: false,
          name: "Chest",
          cardType:'chest',
          chests : [
            
          ],
        })
      }else if(index == 30){//GO TO PRISON
        cardsData.push({
          canBuy: false,
          name: "Prison",
          cardType:'goToPrison',
        })
      }else if(index == 20){//PARKING AREA
        cardsData.push({
          canBuy: false,
          name: "Parking Area",
          cardType:'parkArea',
        })
      }else if(index == 4 || index == 38){//TAXES
        cardsData.push({
          canBuy: false,
          name: "Taxes",
          cardType:'taxes',
          taxesCost: 100,
        })
      }else if(index == 5 || index == 15 ||  index == 25 || index == 35){//STATIONS
        cardsData.push({
          canBuy: true,
          cost: 200,
          distrained: false,
          distrainedCost: 60,
          name: "Train Station",
          owner: "",
          cardType:'station',
          district:'station',
          exchangeSelected: false,
          completedSeries: false,
          rentCosts : {
            one: 50,
            two: 100,
            three: 150,
            four: 200,
          },
          //numOfStations:0
        })
      }else if(index == 10){//PRISON
        cardsData.push({
          canBuy: false,
          name: "Prison Area",
          cardType:'prison',
        })
      }else if(index == 12 || index == 28){//PLANT
        cardsData.push({
          canBuy: true,
          cost: 150,
          distrained: false,
          distrainedCost: 60,
          name: "",
          owner: "",
          cardType:'plant',
          district:'plant',
          exchangeSelected: false,
          completedSeries: false,
          //numOfPlants:0
        })
      }else if(index == 0){//START
        cardsData.push({
          canBuy: false,
          name: "Start",
          cardType:'start',
          reward: 200,
        })
      }
    }
//DistrictName
    cardsData[1].district = 'brown';
    cardsData[3].district = 'brown';
    cardsData[1].name = 'Old Kent Road';
    cardsData[3].name = 'Whitechapel Road';

    cardsData[6].district = 'cyan';
    cardsData[8].district = 'cyan';
    cardsData[9].district = 'cyan';
    cardsData[6].name = 'The Angel Islington';
    cardsData[8].name = 'Euston Road';
    cardsData[9].name = 'Pentonville Road';

    cardsData[11].district = 'magenta';
    cardsData[13].district = 'magenta';
    cardsData[14].district = 'magenta';
    cardsData[11].name = 'Pall Mall';
    cardsData[13].name = 'Whitehall';
    cardsData[14].name = 'Northumberland Avenue';

    cardsData[16].district = 'orange';
    cardsData[18].district = 'orange';
    cardsData[19].district = 'orange';
    cardsData[16].name = 'Bow Street';
    cardsData[18].name = 'Marlborough Street';
    cardsData[19].name = 'Vine Street';

    cardsData[21].district = 'red';
    cardsData[23].district = 'red';
    cardsData[24].district = 'red';
    cardsData[21].name = 'The Strand';
    cardsData[23].name = 'Fleet Street';
    cardsData[24].name = 'Trafalgar Square';

    cardsData[26].district = 'yellow';
    cardsData[27].district = 'yellow';
    cardsData[29].district = 'yellow';
    cardsData[26].name = 'Leicester Square';
    cardsData[27].name = 'Coventry Street';
    cardsData[29].name = 'Piccadilli';
    
    cardsData[31].district = 'green';
    cardsData[32].district = 'green';
    cardsData[34].district = 'green';
    cardsData[31].name = 'Regent Street';
    cardsData[32].name = 'Oxford Street';
    cardsData[34].name = 'Bond Street';

    cardsData[37].district = 'blue';
    cardsData[39].district = 'blue';
    cardsData[37].name = 'Park Lan';
    cardsData[39].name = 'Mayfair';

    cardsData[12].name = 'Electric Company';
    cardsData[28].name = 'Water Works';

    cardsData[5].name = 'King Cross Station';
    cardsData[15].name = 'Marylebone Station';
    cardsData[25].name = 'Fenchurch St Station';
    cardsData[35].name = 'Liverpool Street Station';

    await setDoc(doc(this.db, "gameTables", "monopolyMap"), {cards: cardsData});
  }

  test(){
    //this.checkBankrupt(1550)
   /* this.gameTable.cards.filter((card: { district: string; }) => card.district=='test2').forEach((card: {canBuy: any; owner: any; completedSeries: boolean; }) => {
      card.canBuy = false;
      card.owner = this.actualTurnPlayer.id;
      card.completedSeries = true;
      this.buyProperty(card)
    });*/
  }
}
