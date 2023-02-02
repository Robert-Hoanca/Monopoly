import { Injectable, TemplateRef } from '@angular/core';
import { collection, getFirestore, doc, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
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
import { MessageDialogComponent } from './shared/message-dialog/message-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  //Local Save
  localSave:any = {
    gameName: '',
    gameTable:{},
    players: [],
    turn:0,
    diceNumber:0,
    debt: {
      amountDebt: 0,
      debtWithWho: '',
      setDebt: false,
      amountRent: 0,
    },
    time: {
      begin: 0,
      end: 0,
      gameAmountTime:'',
    },
    playerWhoWonId : '',
    localId: '',
    fancyGraphics: false,
  };
  localSaves:any = {};
  allLocalSaves:Array<any> = [];
  localSaveName:string = '';
  gamePaused:boolean=false;
  //Colors
  bgColors = ["#a7bed3","#c6e2e9","#f1ffc4","#ffcaaf","#dab894","#fddfdf","#fcf7de","#defde0","#def3fd","#f0defd","#FFDFBA","#558F97","#E6DFCC"];
  sessionColor:string= '';
  players: Array<any> = [];
  fancyGraphics:boolean = true;
  //actualTurnPlayer:any = {};
  ambientLightColor:string='#ff8326'

  choosenMode:string = '';
  db = getFirestore();
  chosenMap:string = 'monopolyMap';

  //Camera
  camera:any;
  cameraControls:any;
  cameraPosition: Vector3 | any;
  cameraLookAt: Vector3 | any;

  beginTime:number = 0;
  endTime:number = 0;
  gameAmountTime:string = '';

  gameTable:any = {};
  gameMaps:any = [];
  cardsPositionCounter:number = 0;
  playersModel: any = {};
  pawnTypes: any = [];
  specialPawnTypes: any = [];
  specialPawn:String='';
  diceNumber:number|undefined;
  playerWhoWonId:string = '';

  getCardPosition$ = new Subject();
  setPlayerPosition$ = new Subject();
  openTextDialog$ = new Subject();

  //DIALOGS
  cardInfoRef: MatDialogRef<any> | undefined;
  moneyDialogRef: TemplateRef<any> | undefined;
  exchangeRef: MatDialogRef<any> | undefined;
  randomChest:any;
  randomChance:any;

  turn:number= 0;
  amountRent:number=0;
  amountDebt:number=0;
  setDebt:boolean = false;

  debtWithWho:string='';
  diceRes:Array<number> = [];

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

    this.cameraPosition = new THREE.Vector3(-10,10,-10);
    this.cameraLookAt = new THREE.Vector3();
  }

  chooseSessionColor(){
    this.sessionColor = this.bgColors[Math.floor(Math.random()* this.bgColors.length)];
  }

  retrieveSavesFromLocal(){
    let localStorageAllSaves = [];
    if(localStorage.getItem("rekordLocalSave0")){
      localStorageAllSaves.push(JSON.parse(localStorage.getItem("rekordLocalSave0") || '{}'));
    }else{
      localStorageAllSaves.push('new');
    }
    if(localStorage.getItem("rekordLocalSave1")){
      localStorageAllSaves.push(JSON.parse(localStorage.getItem("rekordLocalSave1") || '{}'));
    }else{
      localStorageAllSaves.push('new');
    }
    if(localStorage.getItem("rekordLocalSave2")){
      localStorageAllSaves.push(JSON.parse(localStorage.getItem("rekordLocalSave2") || '{}'));
    }else{
      localStorageAllSaves.push('new');
    }
    this.allLocalSaves = localStorageAllSaves;
  }

  selectLocalData(index:number){
    this.localSaveName = 'rekordLocalSave' + index;
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

  setCameraPosition(camera:any,x:number, y:number,z:number, duration:number, offset?:number, playerMoving?:boolean, playerRef?:any){
    let xOffset = offset;
    let zOffset = offset;
    if(10 < this.players[this.turn].actualCard && this.players[this.turn].actualCard < 20 && xOffset){
      xOffset+=0;
    }else if(30 < this.players[this.turn].actualCard && this.players[this.turn].actualCard <= 39 && xOffset){
      xOffset-=10;
    }
    if(20 < this.players[this.turn].actualCard && this.players[this.turn].actualCard < 30 && zOffset){
      zOffset+=0;
    }else if(0 < this.players[this.turn].actualCard && this.players[this.turn].actualCard < 10 && zOffset){
      zOffset-=10;
    }
   setTimeout(() => {
    this.cameraControls._objRef.enabled = false;
   }, 0);
   setTimeout(() => {
    this.cameraControls._objRef.enabled = true;
    
   }, duration);
   if(this.cameraControls){
    gsap.fromTo(this.cameraControls._objRef.target, {x: this.cameraControls._objRef.target.x}, {x: x, duration: 1000});
    gsap.fromTo(this.cameraControls._objRef.target, {y: this.cameraControls._objRef.target.y}, {y: y, duration: 1000});
    gsap.fromTo(this.cameraControls._objRef.target, {z: this.cameraControls._objRef.target.z}, {z: z, duration: 1000});
   }
   if(playerMoving != undefined){
    if((playerRef._objRef.position.x != 0 || playerRef._objRef.position.x != 10 || playerRef._objRef.position.x != 20 || playerRef._objRef.position.x != 30) && (x == 0 || x == 10  || x == 20 || x == 30)){
      gsap.fromTo(camera._objRef.position, {x: camera._objRef.position.x}, {x: xOffset ? (x + xOffset ) : x, duration: 1250/1000});
      gsap.fromTo(camera._objRef.position, {y: camera._objRef.position.y}, {y: offset ? (y + offset) : y, duration: 1250/1000});
      setTimeout(() => {
        gsap.fromTo(camera._objRef.position, {z: camera._objRef.position.z}, {z: zOffset ? (z + zOffset) : z, duration: 1250/1000});
      }, 1250);
    }else{
      gsap.fromTo(camera._objRef.position, {z: camera._objRef.position.z}, {z: zOffset ? (z + zOffset) : z, duration: 1250/1000});
      gsap.fromTo(camera._objRef.position, {y: camera._objRef.position.y}, {y: offset ? (y + offset) : y, duration: 1250/1000});
      setTimeout(() => {
        gsap.fromTo(camera._objRef.position, {x: camera._objRef.position.x}, {x: xOffset ? (x + xOffset) : x, duration: 1250/1000});
      }, 1250);
    }
   }else{
    gsap.fromTo(camera._objRef.position, {x: camera._objRef.position.x}, {x: xOffset ? (x + xOffset) : x, duration: duration/1000});
    gsap.fromTo(camera._objRef.position, {y: camera._objRef.position.y}, {y: offset ? (y + offset) : y, duration: duration/1000});
    gsap.fromTo(camera._objRef.position, {z: camera._objRef.position.z}, {z: zOffset ? (z + zOffset) : z, duration: duration/1000});
   }
  }

  getCardPosition(cardIndex:any){
    this.getCardPosition$.next(cardIndex);
  }

  setPlayerPosition(cardPosition:Array<number>, newCardNum:number){
    let oldCardPosition = this.players[this.turn].actualCard;
    this.players[this.turn].actualCard = newCardNum;
    this.players[this.turn].pawn.position =  cardPosition;
    this.setPlayerPosition$.next(cardPosition);
    setTimeout(() => { //SISTEMARE CHE E' ORRIBILE COSI'
      this.checkIfHasPassedStart(oldCardPosition, newCardNum);
      this.whichPropertyAmI(this.gameTable.cards[(this.players[this.turn].actualCard)]);
    }, 1250);
  }

  async startGame(){
    if(this.localSaves == 'new'){
      this.beginTime = Date.now();
      const gameTableRef = doc(this.db, "gameTables", this.chosenMap);
      this.gameTable  = (await getDoc(gameTableRef)).data();
      this.turn = Math.round(Math.random() * ((this.players.length - 1) - 0) + 0);
      this.players[this.turn].canDice = true;
    }else{
      this.gameTable = this.localSaves.gameTable;
      this.players = this.localSaves.players;
      this.turn = this.localSaves.turn;
      this.diceNumber = this.localSaves.diceNumber;
      this.amountDebt = this.localSaves.debt.amountDebt;
      this.amountRent = this.localSaves.amountRent;
      this.debtWithWho = this.localSaves.debt.debtWithWho;
      this.setDebt = this.localSaves.debt.setDebt;
      this.beginTime = this.localSaves.time.begin;
      this.endTime = this.localSaves.time.end;
      this.gameAmountTime = this.localSaves.time.gameAmountTime;
      this.localSaveName = this.localSaves.localId;
      if(this.localSaves.playerWhoWonId){
        this.playerWhoWonId = this.localSaves.playerWhoWonId;
        this.textDialog({text: this.players.find(player => player.id == this.playerWhoWonId).name + ' has won the game!'}, 'finishGame')
      }
    }
    this.router.navigateByUrl('game', { skipLocationChange: true })
  }

  nextTurn(){
    if(this.turn == (this.players.filter(player => player.bankrupt == false).length - 1)){
      this.turn = 0;
    }else{
      this.turn++;
    }

    if(this.players[this.turn].bankrupt){
      this.turn++;
    }
    this.players[this.turn] = this.players[this.turn];
    this.players[this.turn].canDice = true;
    this.diceNumber = undefined;
    this.setCameraPosition(this.camera, this.players[this.turn].pawn.position[0],this.players[this.turn].pawn.position[1],this.players[this.turn].pawn.position[2], 2500, 5);
  }
  async rollTheDice(){
    if(!this.players[this.turn].prison.inPrison){
       this.diceRes = this.getDiceRoll();
      if(this.diceRes[0]==this.diceRes[1]){
        this.players[this.turn].prison.doubleDiceCounter++;
        this.players[this.turn].canDice = true;
      }else{
        this.players[this.turn].prison.doubleDiceCounter=0;
        this.players[this.turn].canDice = false;
      }
      this.diceNumber =( (this.diceRes[0] + this.diceRes[1]) + this.players[this.turn].actualCard);
      if(this.diceNumber && this.diceNumber > (this.gameTable.cards.length - 1)){
        this.diceNumber = 0 + (((this.diceRes[0] + this.diceRes[1])-((this.gameTable.cards.length - 1) - this.players[this.turn].actualCard)) - 1);
      }
      this.getCardPosition(this.diceNumber)
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

  payTaxes(property:any){
    this.players[this.turn].money-= property.taxesCost;
  }
  payRentToPlayer(property:any, shouldPayDept?:boolean){
    if(property.owner && property.owner!=this.players[this.turn].id){
      if(this.players[this.turn].money >= this.amountRent || this.players[this.turn].money >= this.amountDebt){
        if(!shouldPayDept){
          this.players[this.turn].money -= this.amountRent;
          this.players.find(player => player.id == property.owner).money += this.amountRent;
        }else{
          this.players[this.turn].money -= this.amountDebt;
          this.players.find(player => player.id == property.owner).money += this.amountDebt;
        }
        if(this.amountDebt != 0){
          this.amountDebt = 0;
        }
      }
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

  async whichPropertyAmI(property:any){
    if(property.cardType == 'property' || property.cardType == 'station' || property.cardType == 'plant'){
      this.openCardDialog(this.gameTable.cards[this.players[this.turn].actualCard]);
      if(this.gameTable.cards[(this.players[this.turn].actualCard)].owner && this.gameTable.cards[(this.players[this.turn].actualCard)].owner!=this.players[this.turn].id && !this.gameTable.cards[(this.players[this.turn].actualCard)].distrained){
        this.amountRent = await this.calculateTaxesToPay(this.gameTable.cards[(this.players[this.turn].actualCard)],this.diceRes);
        this.textDialog({text:this.players[this.turn].name + ' have to pay ' + this.amountRent + ' of taxes to ' + this.players.find(player => player.id == this.gameTable.cards[(this.players[this.turn].actualCard)].owner).name, property: this.gameTable.cards[(this.players[this.turn].actualCard)], diceRes:this.diceRes, playerRent:true}, 'payMoney'); 
      }
    }else if(property.cardType == 'goToPrison' || this.players[this.turn].prison.doubleDiceCounter == 3){
      this.textDialog({text: this.players[this.turn].name + ' is going to prison.'}, 'goingToPrison');
    }else if(property.cardType == 'taxes'){
      this.textDialog({text:this.players[this.turn].name + ' has payed ' + property.taxesCost + ' of taxes.', property, bankTaxes:true}, 'payMoney');
    }else if(property.cardType == 'chance'){
      this.getChestChance('chance');
    }else if(property.cardType == 'communityChest'){
      this.getChestChance('communityChest');
    }
  }

  //MANAGE PROPERTIES
  showPlayerProps(){
    this.textDialog({text: this.players[this.turn].name, showPlayerProps:true}, 'showPlayerProps')
  }

  buyProperty(property:any){
    this.players[this.turn].money -= property.cost;
    property.canBuy = false;
    property.owner = this.players[this.turn].id;
    if(!property.completedSeries){
      this.checkCompletedSeries(property,this.players[this.turn].id);
    }
  }
  sellProperty(property:any){
    if(!property.distrained){
      this.players[this.turn].money +=  property.cost - ((property.cost / 100) * 10);
    }else{
      this.players[this.turn].money +=  property.distrainedCost - ((property.distrainedCost / 100) * 50);
    }
    this.checkCompletedSeries(property,this.players[this.turn].id);
    property.canBuy = true;
    property.owner = "";
  }
  distrainProperty(property:any){
    property.distrained = true;
    this.players[this.turn].money += property.distrainedCost;
    this.checkCompletedSeries(property,this.players[this.turn].id);
  }
  cancelDistrainedFromProperty(property:any){
    property.distrained = false;
    this.players[this.turn].money -= property.distrainedCost + ((property.distrainedCost / 100) * 20);
    this.checkCompletedSeries(property, this.players[this.turn].id);
  }

  sortProperties(properties:Array<any>){
    let propDistrics:Array<any> = [];
    let sortedProps:Array<any> = [];

    properties.forEach(prop => {
      if(!propDistrics.includes(prop.district)){
        propDistrics.push(prop.district)
      }
    });

    propDistrics.forEach(propDis => {
      properties.filter((property:any) => property.district == propDis).forEach(founndProp => {
        sortedProps.push(founndProp)
      });
    });
    return sortedProps;
  }
  checkCardColorDistrict(districtName:string){
    if(districtName=='station'){
      return '#000'
    }else if(districtName=='plant'){
      return 'grey'
    }else{
      return districtName
    }
  }

  //DIALOGS
  openCardDialog(card:any){
    if(card.cardType=='property' || card.cardType=='plant' || card.cardType=='station'){
      this.cardInfoRef = this.dialog.open(CardDialogComponent, {
        panelClass: 'propertyInfo',
        hasBackdrop: true,
        autoFocus: false,
        data: {
          card: card,
        }
      });
    }
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

  //https://stackoverflow.com/questions/64460217/open-several-mat-dialogs-one-by-one-after-the-previous-one-is-closed
  textDialog(textData:any, eventType:string) {
    const data = {
      textData,
      eventType,
    }
    this.cardInfoRef = this.dialog.open(MessageDialogComponent, {
      panelClass: 'messadeDialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:true,
      data: data
    });
  }

  //EVENTS
  goToPrison(){
    this.players[this.turn].prison.inPrison = true;
    this.players[this.turn].actualCard = 10;
    this.getCardPosition$.next(10);
    this.players[this.turn].canDice=false;
    //this.nextTurn();
  }

  whatToDoInprison(action:string){
    if(action == 'payToExit'){
      this.exitFromPrison(true, false);
    }if(action == 'freeExit'){
      this.exitFromPrison(false, false);
    }else if(action == 'prisonRoll'){
      const diceRes = this.getDiceRoll();
      if(diceRes[0] == diceRes[1]){
        this.exitFromPrison(false, true,diceRes[0],diceRes[1]);
        
      }else if(this.players[this.turn].prison.inPrisonTurnCounter == 2){
        this.exitFromPrison(true, false,diceRes[0],diceRes[1]);
      }else{
        this.players[this.turn].prison.inPrisonTurnCounter++;
        this.players[this.turn].canDice = false;
      }
    }
  }

  exitFromPrison(shouldPay:boolean, exitFromDice:boolean, dice1?:number, dice2?:number){
    if(shouldPay && !exitFromDice){
      if(this.players[this.turn].money < 50){
        this.calculateAmountDebt(50);
      }else{
        this.textDialog({text:this.players[this.turn].name + ' has payed ' + 50 +' and exit from prison.', actualPlayer: this.players[this.turn], dice1, dice2, shouldPay, exitFromDice}, 'exitFromPrison');
      }
      this.players[this.turn].canDice=true;
    }else if(exitFromDice && dice1 && dice2){
      this.textDialog({text:this.players[this.turn].name + ' has exit from prison.', actualPlayer: this.players[this.turn], dice1, dice2,shouldPay, exitFromDice},'exitFromPrison');
    }else if(!shouldPay && !exitFromDice){
      this.textDialog({text:this.players[this.turn].name + ' exit from prison using free card.', actualPlayer: this.players[this.turn],shouldPay, exitFromDice}, 'exitFromPrison');
      this.players[this.turn].canDice=true;
    }
    this.players[this.turn].prison.inPrison=false;
    this.players[this.turn].prison.doubleDiceCounter=0;
    this.players[this.turn].prison.inPrisonTurnCounter=0;
  }

  //Check if the player has passet start, if so give him 200
  checkIfHasPassedStart(beforeMove:number, afterMove:number|undefined){
    if(afterMove!=undefined && (afterMove < beforeMove) || afterMove == 0){
      this.textDialog({text: this.players[this.turn].name + ' gained 200', duration: 1000}, 'passedStart')
    }
  }

  //Find if a player has completed a completed series of the given card
  checkCompletedSeries(property:any,playerId:string){
    const groupCards = this.gameTable.cards.filter((card: { district: any; }) => card.district == property.district) //ALL CARDS
    const ownerCards = groupCards.filter((card: { owner: any; }) => card.owner == playerId)
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

  //Get a chanche or communityChest card 
  getChestChance(cardType:string){
    if(cardType=='chance'){
      this.randomChance = this.gameTable.chance[(Math.round(Math.random() * ( this.gameTable.chance.length) - 1) + 0)];
      this.textDialog(this.randomChance,'chance');
    }else{
      this.randomChest = this.gameTable.communitychest[(Math.round(Math.random() * ( this.gameTable.communitychest.length) - 1) + 0)]
      this.textDialog(this.randomChest,'communityChest');
    }
  }

  //BANKRUPT --> Check if player can eventually pay the debt, otherwise the player goes bankrupt
  checkBankrupt(player:any, moneyToSub:number, playerToPay?:number){
    const playerProps= this.gameTable.cards.filter((card: { owner: any; })=>card.owner == player.id);
    let moneyFromDistrain = 0;
    if((player.money - moneyToSub - this.amountDebt)<0 && playerProps.length<1){
      this.textDialog({text: player.name + ' went bankrupt', player, playerToPay}, 'backrupt');
      return true;
    }else if(playerProps.length && (player.money - moneyToSub)<0){
      playerProps.forEach((prop: any) => {
        if(!prop.distrained){
          moneyFromDistrain += prop.distrainedCost;
          if(prop.hotelCounter){
            moneyFromDistrain += prop.hotelCost;
          }else if(prop.housesCounter){
            moneyFromDistrain += prop.houseCost;
          }
        }
      });
      if(((player.money - moneyToSub - this.amountDebt) + moneyFromDistrain)<0){
        this.textDialog({text: player.name + ' went bankrupt', player, playerToPay},'backrupt');
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  askIfShouldGoBankrupt(){
    this.textDialog({text: 'You are going to go bankrupt. Confirm?', goBankRupt:true}, 'goBankRupt')
  }

  goBankRupt(){
    this.players[this.turn].bankrupt = true;
    this.checkIfSomeoneWon();
  }

  //Check if a player has won the game
  checkIfSomeoneWon(){
    if(this.players.filter(player => !player.bankrupt).length == 1){
      this.endTime = Date.now();
      this.playerWhoWonId = this.players.find(player => !player.bankrupt).id;
      this.calculateGameTime()
      this.textDialog({text: this.players.find(player => !player.bankrupt).name + ' has won the game!', playerWhoWonId: this.players.find(player => !player.bankrupt).id}, 'finishGame')
    }
  }

  calculateGameTime(){
    var seconds = Math.round((this.endTime - this.beginTime)) / 1000;
    var hours = Math.round(( seconds / 3600 )); // 3,600 seconds in 1 hour
    seconds = seconds % 3600;
    var minutes = Math.round(( seconds / 60 )); // 60 seconds in 1 minute
    seconds = Math.round(seconds % 60);
    this.gameAmountTime = hours + ' : ' + minutes + ' : ' + seconds;
  }

  //Calculate the amount of debt that a player have to pay to continue playing
  calculateAmountDebt(specialEventAmount?:any, playerId?:string){
    console.log("calculating debt")
    if(!specialEventAmount){
      this.debtWithWho = 'player';
      this.setDebt = true;
      if(this.amountDebt == 0){
        this.amountDebt = (this.amountRent - this.players[this.turn].money);
      }else{
        this.amountDebt = this.amountDebt + (this.amountRent - this.players[this.turn].money);
      }
    }else if(specialEventAmount){
      this.debtWithWho = 'bank';
      this.setDebt = true;
      if(this.amountDebt==0){
        this.amountDebt = (specialEventAmount - (playerId??this.players[this.turn].money))
      }else{
        this.amountDebt = this.amountDebt + (specialEventAmount - (playerId??this.players[this.turn].money))
      }
    }
    if(this.debtWithWho == 'player'){
      this.textDialog({text:this.players[this.turn].name + ' have to pay ' + this.amountDebt + ' of debts to ' + this.players.find(player => player.id == this.gameTable.cards[(this.players[this.turn].actualCard)].owner).name, property: this.gameTable.cards[(this.players[this.turn].actualCard)],amountDebt:this.amountDebt, playerRent:true, debtWithWho: this.debtWithWho}, 'payMoney');
      if(this.setDebt){
        (playerId? this.players.find(player => player.id == playerId) : this.players[this.turn]).money = 0;
      }
    }else if(this.debtWithWho == 'bank'){
      this.textDialog({text:(playerId??this.players[this.turn].name) + ' have to pay ' + this.amountDebt + ' of debts to the bank.',debtWithWho: this.debtWithWho,amountDebt:this.amountDebt, playerRent:false, playerId: playerId??''}, 'payMoney');
      if(this.setDebt){
        (playerId? this.players.find(player => player.id == playerId) : this.players[this.turn]).money = 0;
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
          name: "Community Chest",
          cardType:'communityChest',
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
    cardsData[1].district = '#663300';
    cardsData[3].district = '#663300';
    cardsData[1].name = 'Old Kent Road';
    cardsData[3].name = 'Whitechapel Road';

    cardsData[6].district = '#0099CC';
    cardsData[8].district = '#0099CC';
    cardsData[9].district = '#0099CC';
    cardsData[6].name = 'The Angel Islington';
    cardsData[8].name = 'Euston Road';
    cardsData[9].name = 'Pentonville Road';

    cardsData[11].district = '#FF3399';
    cardsData[13].district = '#FF3399';
    cardsData[14].district = '#FF3399';
    cardsData[11].name = 'Pall Mall';
    cardsData[13].name = 'Whitehall';
    cardsData[14].name = 'Northumberland Avenue';

    cardsData[16].district = '#FF9933';
    cardsData[18].district = '#FF9933';
    cardsData[19].district = '#FF9933';
    cardsData[16].name = 'Bow Street';
    cardsData[18].name = 'Marlborough Street';
    cardsData[19].name = 'Vine Street';

    cardsData[21].district = '#FF3300';
    cardsData[23].district = '#FF3300';
    cardsData[24].district = '#FF3300';
    cardsData[21].name = 'The Strand';
    cardsData[23].name = 'Fleet Street';
    cardsData[24].name = 'Trafalgar Square';

    cardsData[26].district = '#FFFF33';
    cardsData[27].district = '#FFFF33';
    cardsData[29].district = '#FFFF33';
    cardsData[26].name = 'Leicester Square';
    cardsData[27].name = 'Coventry Street';
    cardsData[29].name = 'Piccadilli';
    
    cardsData[31].district = '#339933';
    cardsData[32].district = '#339933';
    cardsData[34].district = '#339933';
    cardsData[31].name = 'Regent Street';
    cardsData[32].name = 'Oxford Street';
    cardsData[34].name = 'Bond Street';

    cardsData[37].district = '#000066';
    cardsData[39].district = '#000066';
    cardsData[37].name = 'Park Lan';
    cardsData[39].name = 'Mayfair';

    cardsData[12].name = 'Electric Company';
    cardsData[28].name = 'Water Works';

    cardsData[5].name = 'King Cross Station';
    cardsData[15].name = 'Marylebone Station';
    cardsData[25].name = 'Fenchurch St Station';
    cardsData[35].name = 'Liverpool Street Station';


    
    let chance= [
    {
      "title": "Advance to Go (Collect $200)",
      "action": "move",
      "tileid": "go",
      "cardIndex": 0
    },
    {
      "title": "Advance to Trafalgar Square - If you pass Go, collect $200",
      "action": "move",
      "tileid": "trafalgarsquare",
      "cardIndex": 24
    },
    {
      "title": "Advance to Pall Mall - If you pass Go, collect $200",
      "action": "move",
      "tileid": "pallmall",
      "cardIndex": 11
    },
    {
      "title": "Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total ten times the amount thrown.",
      "action": "movenearest",
      "groupid": "plant",
      "rentmultiplier": 10,
    },
    {
      "title": "Advance token to the nearest Railroad and pay owner twice the rental to which he/she is otherwise entitled. If Railroad is unowned, you may buy it from the Bank.",
      "action": "movenearest",
      "groupid": "station",
      "rentmultiplier": 2,
    },
    {
      "title": "Bank pays you dividend of $50",
      "action": "addfunds",
      "amount": 50
    },
    {
      "title": "Get out of Jail Free - This card may be kept until needed, or traded/sold",
      "action": "jail",
      "subaction": "getout"
    },
    {
      "title": "Go Back 3 Spaces",
      "action": "move",
      "count": -3
    },
    {
      "title": "Go to Jail - Go directly to Jail - Do not pass Go, do not collect $200",
      "action": "jail",
      "subaction": "goto"
    },
    {
      "title": "Make general repairs on all your property - For each house pay $25 - For each hotel $100",
      "action": "propertycharges",
      "houses": 25,
      "hotels": 100
    },
    {
      "title": "Pay poor tax of $15",
      "action": "removefunds",
      "amount": 15
    },
    {
      "title": "Take a trip to King Cross Station - If you pass Go, collect $200",
      "action": "move",
      "tileid": "kingcrossstation",
      "cardIndex": 5
    },
    {
      "title": "Take a walk on the Mayfair - Advance token to Boardwalk",
      "action": "move",
      "tileid": "mayfair",
      "cardIndex": 39
    },
    {
      "title": "You have been elected Chairman of the Board - Pay each player $50",
      "action": "removefundstoplayers",
      "amount": 50
    },
    {
      "title": "Your building loan matures - Collect $150",
      "action": "addfunds",
      "amount": 50
    }
  ]
    let communitychest = [
    {
      "title": "Advance to Go (Collect $200)",
      "action": "move",
      "tileid": "go",
      "cardIndex": 0
    },
    {
      "title": "Bank error in your favor - Collect $200 ",
      "action": "addfunds",
      "amount": 200
    },
    {
      "title": "Doctor fee - Pay $50",
      "action": "removefunds",
      "amount": 50
    },
    {
      "title": "From sale of stock you get $50",
      "action": "addfunds",
      "amount": 50
    },
    {
      "title": "Get Out of Jail Free",
      "action": "jail",
      "subaction": "getout"
    },
    {
      "title": "Go to Jail - Go directly to jail - Do not pass Go - Do not collect $200",
      "action": "jail",
      "subaction": "goto"
    },
    {
      "title": "Grand Opera Night - Collect $50 from every player for opening night seats",
      "action": "addfundsfromplayers",
      "amount": 50
    },
    {
      "title": "Holiday Fund matures - Receive $100",
      "action": "addfunds",
      "amount": 100
    },
    {
      "title": "Income tax refund - Collect $20",
      "action": "addfunds",
      "amount": 20
    },
    {
      "title": "Life insurance matures - Collect $100",
      "action": "addfunds",
      "amount": 100
    },
    {
      "title": "Pay hospital fees of $100",
      "action": "removefunds",
      "amount": 100
    },
    {
      "title": "Pay school fees of $150",
      "action": "removefunds",
      "amount": 150
    },
    {
      "title": "Receive $25 consultancy fee",
      "action": "addfunds",
      "amount": 25
    },
    {
      "title": "You are assessed for street repairs - $40 per house - $115 per hotel",
      "action": "propertycharges",
      "houses": 40,
      "hotels": 115
    },
    {
      "title": "You have won second prize in a beauty contest - Collect $10",
      "action": "addfunds",
      "amount": 10
    },
    {
      "title": "You inherit $100",
      "action": "addfunds",
      "amount": 100
    }
  ]


    await setDoc(doc(this.db, "gameTables", "monopolyMap"), {cards: cardsData, chance: chance,communitychest: communitychest});
  }
}
