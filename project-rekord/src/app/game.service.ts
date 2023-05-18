import { Injectable } from '@angular/core';
import { collection, getFirestore, doc, getDoc, getDocs, setDoc, deleteDoc } from '@angular/fire/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import 'firebase/firestore';
import { Router } from '@angular/router';
import { Observable, Subject, switchMap, take, timer } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CardDialogComponent } from './shared/card-dialog/card-dialog.component';
import { ExchangeComponent } from './shared/exchange/exchange.component';
import * as uuid from 'uuid';
import gsap from 'gsap'
import { Vector3 } from 'three';
import { MessageDialogComponent } from './shared/message-dialog/message-dialog.component';
import * as THREE from 'three';

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
  };
  loading:boolean = false;
  localSaves:any = {};
  allLocalSaves:Array<any> = [];
  localSaveName:string = '';
  gamePaused:boolean=false;
  userDevice:string='';
  gameScene:any;

  //Game Colors
  bgColors = [];
  sessionColor:string= '';
  sessionTheme:any;
  players: Array<any> = [];
  themes: any;

  choosenMode:string = '';
  db = getFirestore();
  godData:any;
  chosenMap:string = 'monopolyMap';

  //Camera
  camera:any;
  aspect = window.innerWidth / window.innerHeight;
  distance:number = 15;
  cameraControls:any;
  cameraPosition: Vector3 | any;
  movingCamera:boolean= false;
  movingPlayer:boolean = false;
  enableMapControls:boolean = false;
  cameraZoom:number = 1.2;

  //Renderer
  rendererOptions:any={
    shadowMap:{
    },
    antialias: true,
  }

  // --- Game --- //

  //GameTime
  beginTime:number = 0;
  endTime:number = 0;
  gameAmountTime:string = '';

  gameTable:any = {};
  gameMaps:any = [];
  cardsPositionCounter:number = 0;
  playersModel: any = {};
  pawnTypes: any = [];
  pawnUrls:Array<any> = [];
  specialPawnTypes: any = [];
  specialPawn:String='';
  randomChest:any;
  randomChance:any;
  turn:number= 0;
  amountRent:number=0;
  amountDebt:number=0;
  setDebt:boolean = false;

  debtWithWho:string='';
  diceRes:Array<number> = [];

  //Dice
  diceNumber:number|undefined;
  startToDice:boolean = false;
  playerWhoWonId:string = '';
  addingPlayerMoney:boolean=false;
  removingPlayerMoney:boolean=false;
  playerMoneyChangeValue:number= 0;

  //Subjects
  getCardPosition$ = new Subject();
  setPlayerPosition$ = new Subject();
  openTextDialog$ = new Subject();
  shouldRemovePlayerCage$ = new Subject();
  changeCardBorderColor$ = new Subject();
  screenLoaded$ = new Subject();

  //DIALOGS
  cardInfoRef: MatDialogRef<any> | undefined;
  exchangeRef: MatDialogRef<any> | undefined;

  //Extra Options
  debugMode:boolean = false;
  godMode:boolean = false;
  enableCursor:boolean = false;
  constructor(private afs: AngularFirestore,public router: Router, public dialog: MatDialog) { }

  async retrieveDBData(){
    //const storage = getStorage();

    //Debug God
    const getInfo = doc(this.db, "god", 'debugGod');
    this.godData = (await getDoc(getInfo)).data();

    let localGodModeValue:any = localStorage.getItem("monopolyGodMode");
    if(localStorage.getItem("monopolyGodMode") && JSON.parse(localGodModeValue)){
      this.godMode = true;
    }

    //Maps
    await this.getGameMaps();

    //bgColors
    const getBgColors = doc(this.db, "colors", 'bgColors');


    const colors = (await getDoc(getBgColors)).data();
    if(colors){
      this.bgColors = colors['colors'];
    }


    //Themes
    const getThemes = doc(this.db, "colors", 'themes');
    const themes = await (await getDoc(getThemes)).data();
    if(themes){
      this.themes = themes['themes'];
    }

    //PlayerModel
    const playersModelRef = doc(this.db, "playerModel", 'playerModel');
    this.playersModel = await (await getDoc(playersModelRef)).data();

    //Pawn Types
    const pawnTypesRef = await getDocs(collection(this.db, "pawnTypes"));
    pawnTypesRef.forEach((doc) => {
      doc.data()['specialPawn'] ? this.specialPawnTypes.push(doc.data()):this.pawnTypes.push(doc.data());
    });
    this.pawnTypes.forEach((pawn:any) => {
        this.pawnUrls.push('/assets/blenderModels/pawns/' + pawn.value + '/scene.gltf')
    });

    this.loading = false;
  }

  async getGameMaps(){
    const getMaps = await getDocs(collection(this.db, "gameTables"));
    this.gameMaps = [];
    getMaps.forEach((doc) => {
      this.gameMaps.push(doc.id)
    });
  }

  chooseSessionColor(){
    this.sessionTheme = this.themes[Math.floor(Math.random() * this.themes.length)];
    this.sessionColor = this.sessionTheme.background;
  }
  LightenDarkenColor(col:string,amt:number) {
    //Return a lighten / darken color based on the given color
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col,16);

    var r = (num >> 16) + amt;

    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;

    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;

    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
  }

  returnInclude(element:any, string:string){
    return element.includes(string)
  }
  goBackHome(){
    location.reload();
  }
  switchRouter(url:string){
    this.router.navigateByUrl(url, { skipLocationChange: true });
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
    //Create a player with the defalt fields, give to id a uuid.
    const type = this.specialPawn != ''? 'special' : 'normal';
    const newPlayer = JSON.parse(JSON.stringify(this.playersModel));
    newPlayer.name = name;
    newPlayer.id = uuid.v4();
    newPlayer.money = 1500;
    newPlayer.pawn.choosenPawnLabel = type == 'normal'? this.pawnTypes[pawnIndex].name : this.specialPawnTypes.find((pawn: { value: String; }) => pawn.value == this.specialPawn).name;
    newPlayer.pawn.choosenPawnValue =  type == 'normal'? this.pawnTypes[pawnIndex].value : this.specialPawnTypes.find((pawn: { value: String; }) => pawn.value == this.specialPawn).value;
    switch (this.players.filter(player => player.id != newPlayer.id).length) {
      case 0:
        newPlayer.pawn.position = [0.5,0,0.5]
        newPlayer.pawn.cardSection = 0;
        break;
      case 1:
        newPlayer.pawn.position = [0.5,0,-0.5]
        newPlayer.pawn.cardSection = 1;
        break;
      case 2:
        newPlayer.pawn.position = [-0.5,0,-0.5]
        newPlayer.pawn.cardSection = 2;
        break;
      case 3:
        newPlayer.pawn.position = [-0.5,0,0.5]
        newPlayer.pawn.cardSection = 3;
        break;

      default:
        newPlayer.pawn.position = [0,0,0]
        break;
    }
    newPlayer.pawn.rotationSide = 0;
    newPlayer.canDice = false;
    newPlayer.actualCard = 0;
    this.players.push(newPlayer);
    type == 'normal'? this.pawnTypes.splice(pawnIndex,1) : this.specialPawnTypes.splice(this.specialPawnTypes.findIndex((pawn: { name: String; }) => pawn.name == this.specialPawn),1);
    this.specialPawn= '';
  }

  setCameraPosition(cameraPosition:Array<number>, cameraControlsPosition:Array<number>, duration:number){
    //Camera
    if(this.userDevice.includes('phone')){
      if(cameraPosition){
        gsap.fromTo(this.camera._objRef.position, {x: this.camera._objRef.position.x}, {x: cameraPosition[0], duration: duration/1000});
        gsap.fromTo(this.camera._objRef.position, {y: this.camera._objRef.position.y}, {y: cameraPosition[1], duration: duration/1000});
        gsap.fromTo(this.camera._objRef.position, {z: this.camera._objRef.position.z}, {z: cameraPosition[2], duration: duration/1000});
      }

      //Camera Controls
      if(cameraControlsPosition){
        gsap.fromTo(this.cameraControls._objRef.target, {x: this.cameraControls._objRef.target.x}, {x: cameraControlsPosition[0], duration: duration/1000});
        gsap.fromTo(this.cameraControls._objRef.target, {y:this.cameraControls._objRef.target.y}, {y: cameraControlsPosition[1], duration: duration/1000});
        gsap.fromTo(this.cameraControls._objRef.target, {z: this.cameraControls._objRef.target.z}, {z: cameraControlsPosition[2], duration: duration/1000});
      }
    }
  }

  setCameraOnPlayer(timeOutTimer:number){

    if(this.userDevice.includes('phone')){
      const playerCardIndex = this.players[this.turn].actualCard;
      let numberToSumSub = 0;

      if(playerCardIndex <= 10){
        numberToSumSub = playerCardIndex;
      } else if (playerCardIndex >= 10 && playerCardIndex <= 20){
        numberToSumSub = 10 - (playerCardIndex - 10);
      }else if (playerCardIndex >= 20 && playerCardIndex <= 30){
        numberToSumSub = - (playerCardIndex - 20);
      }else if (playerCardIndex >= 30 && playerCardIndex <= 39){
        numberToSumSub = - (40 - playerCardIndex);
      }

      timer(timeOutTimer).pipe(take(1)).subscribe({
        complete: () => {
          this.setCameraPosition([(-10) + numberToSumSub , 10 , (-10) - numberToSumSub], [(8) + numberToSumSub, 0 , (8) - numberToSumSub], 1000)
        }
      })
    }

  }

  getCardPosition(cardIndex:any){
    this.getCardPosition$.next(cardIndex);
  }

  changeCardColor(){
    this.gameScene.children.forEach((child:any) => {
      if( child.name.includes('cardNumber')){
        child.traverse((child:any) => {
          if(child.isMesh ){
            const material = new THREE.MeshBasicMaterial({color: this.sessionTheme.cardColor});
            child.material = material
          }
        })
      }else if( child.name.includes('cardOutline')){
        child.traverse((child:any) => {
          if(child.isMesh ){
           const material = new THREE.MeshBasicMaterial({color: this.sessionTheme.cardBorder, side: THREE.BackSide});
            child.material = material
          }
        })
      }
    });
  }

  resizeCanvas(event:any, camera:any){

    if(camera._objRef != undefined && camera._objRef.zoom != this.cameraZoom){
      camera._objRef.zoom = this.cameraZoom;

      let evt =  new WheelEvent("wheel", {deltaY : this.cameraZoom})
      document.querySelector("canvas")?.dispatchEvent(evt);
    }
    this.aspect = event.width / event.height;
  }

  setPlayerPosition(cardPosition:Array<number>, newCardNum:number){
    let oldCardPosition = JSON.parse(JSON.stringify((this.players[this.turn].actualCard)));
    this.changeCardBorderColor$.next({type: 'hoverFromPlayerMoving',color: '#ffffff', newCardIndex:newCardNum})
    this.players[this.turn].actualCard = newCardNum;
    this.setPlayerPosition$.next({cardPosition, oldCardPosition});
  }

  async startGame(){
    this.loading = true;
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
    this.switchRouter('game');
  }

  nextTurn(){
    if(this.startToDice){
      this.startToDice = false;
    }
    if(this.turn == (this.players.length - 1)){
      this.turn = 0;
    }else{
      this.turn++;
    }

    if(this.players[this.turn].bankrupt){
      while(this.players[this.turn].bankrupt){
        this.turn++;
        if(this.turn == (this.players.length)){
          this.turn = 0;
        }
      }
    }
    //this.players[this.turn] = this.players[this.turn];
    this.setCameraOnPlayer(0)
    this.players[this.turn].canDice = true;
    this.diceNumber = undefined;

    if(this.randomChance || this.randomChest){
      this.randomChance = undefined;
      this.randomChance = undefined;
    }
  }

  payTaxes(property:any){
    this.addingRemovingMoney('remove', property.taxesCost, 1000)
  }
  payRentToPlayer(property:any, shouldPayDept?:boolean){
    if(property.owner && property.owner!=this.players[this.turn].id){
      if(this.players[this.turn].money >= this.amountRent || this.players[this.turn].money >= this.amountDebt){
        if(!shouldPayDept){
          this.addingRemovingMoney('remove', this.amountRent, 1000);
          this.addingRemovingMoney('add', this.amountRent, 1000, this.players.find(player => player.id == property.owner))
        }else{
          this.addingRemovingMoney('remove', this.amountDebt, 1000);
          this.addingRemovingMoney('add', this.amountDebt, 1000,this.players.find(player => player.id == property.owner));
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
      this.textDialog({text: this.players[this.turn].name + ' have to go to prison.'}, 'goingToPrison');
    }else if(property.cardType == 'taxes'){
      this.textDialog({text:this.players[this.turn].name + ' have to pay ' + property.taxesCost + ' of taxes.', property, bankTaxes:true}, 'payMoney');
    }else if(property.cardType == 'chance'){
      this.getChestChance('chance');
    }else if(property.cardType == 'communityChest'){
      this.getChestChance('communityChest');
    }
  }

  addingRemovingMoney(type:string, amount:number,duration:number, player?:any){

    new Observable((subscriber) => {
      this.playerMoneyChangeValue = amount;
      if(type=='add'){
        player? player.addingMoney = true : this.players[this.turn].addingMoney = true;
        player != undefined? player.money += amount : this.players[this.turn].money += amount;
      }else if(type=='remove'){
        player? player.removingMoney = true : this.players[this.turn].removingMoney = true;
        player != undefined? player.money -= amount : this.players[this.turn].money -= amount;
      }
      subscriber.next(duration)
    }).pipe(switchMap((data:any):any => {
      return timer(data)
    })).pipe(take(1)).subscribe({
      next : (data) => {
        if(type=='add'){
          player? player.addingMoney = false : this.players[this.turn].addingMoney = false;
        }else if(type=='remove'){
          player? player.removingMoney = false : this.players[this.turn].removingMoney = false;
        }
      }
    })

  }

  addingRemovingMoneyProps(){
    if(this.players.filter(player => player.addingMoney == true).length > 0){
      this.players.filter(player => player.addingMoney == true).forEach(player => {
        player.addingMoney = false;
      });
    }

    if(this.players.filter(player => player.removingMoney == true).length > 0){
      this.players.filter(player => player.removingMoney == true).forEach(player => {
        player.removingMoney = false;
      });
    }
  }

  //MANAGE PROPERTIES
  showPlayerProps(){
    this.textDialog({text: this.players[this.turn].name, showPlayerProps:true}, 'showPlayerProps')
  }

  buyProperty(property:any){
    this.addingRemovingMoney('remove', property.cost, 1000);
    property.canBuy = false;
    property.owner = this.players[this.turn].id;
    if(!property.completedSeries){
      this.checkCompletedSeries([property]);
    }
  }
  sellProperty(property:any){
    if(!property.distrained){
      this.addingRemovingMoney('add', (property.cost - ((property.cost / 100) * 10)), 1000);
    }else{
      this.addingRemovingMoney('add',(property.distrainedCost - ((property.distrainedCost / 100) * 50)), 1000);
    }
    this.checkCompletedSeries([property]);
    property.canBuy = true;
    property.owner = "";
  }
  distrainProperty(property:any){
    property.distrained = true;
    this.addingRemovingMoney('add', property.distrainedCost, 1000);
    this.checkCompletedSeries([property]);
  }
  cancelDistrainedFromProperty(property:any){
    property.distrained = false;
   this.addingRemovingMoney('remove', property.distrainedCost, 1000);
    this.checkCompletedSeries([property]);
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
      return '#808080'
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
        disableClose:true,
        autoFocus: false,
        data: {
          card: card,
        }
      });
    }
  }
  openCompletedSeriesDialog(cards:Array<any>){
    this.cardInfoRef = this.dialog.open(CardDialogComponent, {
      panelClass: 'completedSeriesInfo',
      hasBackdrop: true,
      disableClose:true,
      autoFocus: false,
      height: '60%',
      data: {
        cards: cards,
        completedSeries: true
      }
    });
  }
  openExchangeDialog(){
    this.cardInfoRef = this.dialog.open(ExchangeComponent, {
      panelClass: 'exchangePanel',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:true,
      data: {
      }
    });
  }

  textDialog(textData:any, eventType:string) {
    const data = {
      textData,
      eventType,
    }
    this.cardInfoRef = this.dialog.open(MessageDialogComponent, {
      panelClass: 'messageDialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:true,
      data: data
    });
  }

  closeDialog(dialogRef:any){
    dialogRef.close()
  }

  //EVENTS
  goToPrison(){
    this.players[this.turn].prison.inPrison = true;
    const prisonIndex = this.gameTable.cards.findIndex((card: { cardType: string; }) => card.cardType === 'prison');
    this.getCardPosition$.next(prisonIndex);
    this.players[this.turn].canDice=false;
  }

  exitFromPrison(shouldPay:boolean, exitFromDice:boolean, dice1?:number, dice2?:number){
    if(shouldPay && !exitFromDice){
      if(this.players[this.turn].money < 50){
        this.calculateAmountDebt(50);
      }else{
        this.textDialog({text:this.players[this.turn].name + ' have to pay ' + 50 +' and then exit from prison.', actualPlayer: this.players[this.turn], dice1, dice2, shouldPay, exitFromDice}, 'exitFromPrison');
      }
      this.players[this.turn].canDice=true;
    }else if(exitFromDice && dice1 && dice2){
      this.textDialog({text:this.players[this.turn].name + ' has exit from prison.', actualPlayer: this.players[this.turn], dice1, dice2,shouldPay, exitFromDice},'exitFromPrison');
    }else if(!shouldPay && !exitFromDice){
      this.textDialog({text:this.players[this.turn].name + ' exit from prison using free card.', actualPlayer: this.players[this.turn],shouldPay, exitFromDice}, 'exitFromPrison');
      this.players[this.turn].canDice=true;
    }
    this.shouldRemovePlayerCage$.next({
      playerId: this.players[this.turn].id,
      oldCardPosition: this.players[this.turn].actualCard
    })

    this.players[this.turn].prison.inPrison=false;
    this.players[this.turn].prison.doubleDiceCounter=0;
    this.players[this.turn].prison.inPrisonTurnCounter=0;
  }

  playerPassedStart(){
    if(!this.players[this.turn].prison.inPrison && this.players[this.turn].canReceiveMoneyFromStart){
      this.addingRemovingMoney('add', 200, 1000);
    }
  }

  //Find if a player has completed a completed series of the given card
  checkCompletedSeries(properties:Array<any>){
    const possibleDistricts:any = [];
    const foundCompleted:Array<any> = [];
    properties.forEach(property => {
      if(!possibleDistricts.includes(property.district)){
        possibleDistricts.push(property.district)
      }
    });

    possibleDistricts.forEach((district:string) => {
      const groupCards = this.gameTable.cards.filter((card:any) => card.district == district);
      const ownerCards = groupCards.filter((card: { owner: any; }) => card.owner == groupCards[0].owner);
      if(groupCards.length == ownerCards.length && ownerCards.findIndex((cardI: { distrained: any; }) => cardI.distrained)<0){
        groupCards.forEach((card: { completedSeries: boolean; }) => {
          if(!card.completedSeries){  card.completedSeries = true;}
        });
        foundCompleted.push(groupCards);
      }else{
        groupCards.forEach((card: { completedSeries: boolean; }) => {
          if(card.completedSeries){  card.completedSeries = false;}
        });
      }
    });
    this.openCompletedSeriesDialog(foundCompleted);
  }

  //Get a chanche or communityChest card
  getChestChance(cardType:string){
    if(cardType=='chance'){
      const randomNum = (Math.round(Math.random() * ( this.gameTable.chance.length - 1) ) + 0);
      this.randomChance = this.gameTable.chance[randomNum];
      this.textDialog(this.randomChance,'chance');
    }else{
      const randomNum = (Math.round(Math.random() * ( this.gameTable.communitychest.length - 1)) + 0)
      this.randomChest = this.gameTable.communitychest[randomNum]
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
  async checkIfSomeoneWon(){
    if(this.players.filter(player => !player.bankrupt).length == 1){
      this.endTime = Date.now();
      this.playerWhoWonId = this.players.find(player => !player.bankrupt).id;
      this.calculateGameTime()
      this.textDialog({text: this.players.find(player => !player.bankrupt).name + ' has won the game!', playerWhoWonId: this.players.find(player => !player.bankrupt).id}, 'finishGame')
    }else{
      await this.gameTable.cards.filter((card:any) => card.owner == this.players[this.turn].id).forEach((foundCard:any) => {
        foundCard.owner = '';
        foundCard.canBuy = true;
        if(foundCard.housesCounter>0){
          foundCard.housesCounter = 0;
          if(foundCard.hotelCounter>0){
            foundCard.hotelCounter = 0;
          }
        }

      });
      this.nextTurn()
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

  getContrastColor(bgColor:string) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
    '#000' : '#fff';
  }


  test(){
    const numOfCells = -10
    this.randomChance = {
      action: "move",
      count: numOfCells,
      title: 'Go Back' + Math.abs(numOfCells) + 'Spaces'
    };
    this.textDialog(this.randomChance,'chance');
  }

  //Database Management

  async setThemesDb(themes:any){
    setDoc(doc(this.db, "colors", "themes"), {themes});
  }

  async saveMapToDb(mapName:string,gameTable:any){
    setDoc(doc(this.db, "gameTables", mapName), gameTable);
  }

  async deleteMapFromDb(mapName:string){
    deleteDoc(doc(this.db, "gameTables", mapName));
  }

}
