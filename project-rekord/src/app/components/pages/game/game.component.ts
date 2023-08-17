import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { gsap } from 'gsap';
import { Subscription, take, timer } from 'rxjs';
import { EventTypes } from 'src/app/enums/eventTypes';
import { MessageTypes } from 'src/app/enums/onlineMessageType';
import { cardModel } from 'src/app/models/card';
import { playerModel } from 'src/app/models/player';
import { GamePhysicsService } from 'src/app/services/game-physics.service';
import { GameService } from 'src/app/services/game.service';
import { OnlineService } from 'src/app/services/online.service';
import { SoundService } from 'src/app/services/sound.service';
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
  animations: [
    trigger(
      'passedStartMoney',
      [
        transition(
          ':enter', [
          style({ top: '-50px', opacity: 0 }),
          animate('250ms ease-in', style({ top: '10px', 'opacity': 1 }))
        ]
        ),
        transition(
          ':leave', [
          style({ top: '10px', 'opacity': 1 }),
          animate('250ms ease-out', style({ top: '-50px', 'opacity': 0 }))
        ])
      ]
    ),
    trigger(
      'showDice',
      [
        transition(
          ':enter', [
          style({ tansform: 'scale(0)', opacity: 0 }),
          animate('250ms ease-in', style({ tansform: 'scale(1)', opacity: 1 }))
        ]
        ),
        transition(
          ':leave', [
          style({ tansform: 'scale(1)', opacity: 1 }),
          animate('250ms ease-out', style({ tansform: 'scale(0)', opacity: 0 }))
        ])
      ]
    ),
    trigger(
      'mmAnimationScale',
      [
        transition(
          ':enter', [
          style({ transform: 'scale(0)', opacity: 0 }),
          animate('300ms ease-in', style({ transform: 'scale(1)', 'opacity': 1 }))
        ]
        ),
        transition(
          ':leave', [
          style({ transform: 'scale(1)', 'opacity': 1 }),
          animate('300ms ease-out', style({ transform: 'scale(0)', 'opacity': 0 }))
        ])
      ]
    ),
  ],
  
})
export class GameComponent implements OnInit {
  @ViewChild('cardInfo', { static: true }) cardInfo:any;

  @ViewChild('canvas', { static: true }) canvas:any;
  @ViewChild('scene', { static: true }) scene:any;

  @ViewChild('camera', { static: true }) camera:any;
  @ViewChild('cameraControls', { static: true }) cameraControls:any;
  @ViewChild('ambientLight', { static: true }) ambientLight:any;

  @ViewChild('sky', { static: true }) sky:any;

  @ViewChild('showDiceResultDialog', { static: true }) showDiceResultDialogRef!: TemplateRef<any>;

  @ViewChild('physicsGround', { static: true }) physicsGround:any;

  @HostListener('window:beforeunload')
  confirmLeavingPageBeforeSaving(): boolean {
    return this.gameService.godMode ? true : false; 
  }

  actualPlayerProps:Array<any> = [];

  openTextDialog$: Subscription | undefined;
  textDialog:string='';
  cardChangedCounter:number = 0;
  cardOutlineChangedCounter:number = 0;
  width:number = 0;
  height:number = 0;

  subscriptions:Array<Subscription> = [];

  pauseOptions:boolean = false;

  constructor(public gameService: GameService,private dialog: MatDialog , public gamePhysicsService : GamePhysicsService, public soundService : SoundService, public onlineService : OnlineService) {  }

  ngOnInit(): void {
    this.gameService.addingRemovingMoneyProps();
  }
  ngAfterViewInit(){

    this.subscriptions.push(
      this.gameService.screenLoaded$.pipe(take(1)).subscribe({
        next : data => {
          if(this.gameService.localSaves == 'new'){
            this.gameService.textDialog({text: this.gameService.players[this.gameService.turn].name + ' begins the game!'}, EventTypes.PLAYER_WHO_BEGINS)
          }
        }
      })
    )

    this.gameService.gameScene = this.scene._objRef;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.gameService.camera = this.camera;
    this.gameService.cameraControls = this.cameraControls;
    this.gameService.enableMapControls = true;

    timer(500).pipe(take(1)).subscribe({
      complete : () =>{
        this.gameService.setCameraZoom();
        this.gameService.players.filter((player:playerModel) => player.bankrupt).forEach(player => {
          this.gameService.showHidePlayerInfo$.next({type : 'show', playerId: player.id})
        });
      }
    })
    this.gameService.setCameraOnPlayer(1500);
    this.activateLocalSave();
    this.gamePhysicsService.initWorld();
    this.gamePhysicsService.showDiceResultDialogRef = this.showDiceResultDialogRef;
    
  }
  activateLocalSave(){
    setInterval(() => {
      this.gameService.localSave.gameTable = this.gameService.gameTable;
      this.gameService.localSave.players = this.gameService.players;
      this.gameService.localSave.turn=this.gameService.turn;
      this.gameService.localSave.diceNumber = this.gameService.diceNumber;
      this.gameService.localSave.debt.amountDebt = this.gameService.amountDebt;
      this.gameService.localSave.debt.debtWithWho = this.gameService.debtWithWho;
      this.gameService.localSave.debt.setDebt = this.gameService.setDebt;
      this.gameService.localSave.playerWhoWonId = this.gameService.playerWhoWonId;
      this.gameService.localSave.debt.amountRent = this.gameService.amountRent;
      this.gameService.localSave.time.begin = this.gameService.beginTime;
      this.gameService.localSave.time.end = this.gameService.endTime;
      this.gameService.localSave.time.gameAmountTime = this.gameService.gameAmountTime;
      if(this.gameService.localSaves.gameName){
        this.gameService.localSave.gameName = this.gameService.localSaves.gameName;
      }
      if(this.gameService.localSaves.localId){
        this.gameService.localSave.localId = this.gameService.localSaves.localId;
      }
      localStorage.setItem(this.gameService.localSaveName, JSON.stringify(this.gameService.localSave));
    }, 5000);
  }
  getActualPlayerProps(){
    return this.gameService.sortProperties(this.gameService.gameTable.cards.filter((card: cardModel) => card.owner == this.gameService.players[this.gameService.turn].id));
  }

  tryToGoNextTurn(){
    if(this.gameService.amountDebt!=0){
      if(this.gameService.debtWithWho == 'player'){
        this.gameService.textDialog({text:this.gameService.players[this.gameService.turn].name + ' have to pay ' + this.gameService.amountDebt + ' of debts to ' + this.gameService.players.find((player:playerModel) => player.id == this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)].owner)?.name, property: this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)],amountDebt:this.gameService.amountDebt, playerRent:true, debtWithWho: this.gameService.debtWithWho}, EventTypes.PAYMONEY);
    
      }else if(this.gameService.debtWithWho == 'bank'){
        this.gameService.textDialog({text:(this.gameService.players[this.gameService.turn].name) + ' have to pay ' + this.gameService.amountDebt + ' of debts to the bank.',debtWithWho: this.gameService.debtWithWho,amountDebt:this.gameService.amountDebt, playerRent:false, playerId:''}, EventTypes.PAYMONEY);
      }
    }else{
      this.gameService.nextTurn();
    }
  }

  rollTheDice(){
    this.gamePhysicsService.dicesRolling = true;
    const player = this.gameService.players[this.gameService.turn]
    const time = this.gameService.userDevice.includes('phone') && player.actualCard !== 0 ? 1000 : 100;
    this.gameService.setCameraPosition([-10,10,-10], [8,0,8], time)

    if(this.gameService.startToDice){
      this.gameService.startToDice = false;
      this.gameService.setOnlineData$.next({path: '/online/message', value :{type : MessageTypes.DICE_END}});
    }

    timer(time).subscribe({
      complete: ()=> {

        if(!this.gameService.players[this.gameService.turn].prison.inPrison){
          this.calculateDicesInitialPos();
        }else{
         this.whatToDoInPrison('prisonRoll')
        }

      }
    })
  }

  whatToDoInPrison(action:string){
    if(action == 'payToExit'){
      this.gameService.exitFromPrison(true, false);
    }if(action == 'freeExit'){
      this.gameService.exitFromPrison(false, false);
    }else if(action == 'prisonRoll'){
      this.calculateDicesInitialPos();
    }
  }

  getDiceResClass(res:number){
    let returnClass = '';
    switch (res) {
      case 3:
        returnClass = 'three';
        break;
      case 4:
        returnClass = 'four';
        break;
      case 5:
        returnClass = 'five';
        break;
      case 6:
        returnClass = 'six';
        break;
    
      default:
        break;
    }
    return returnClass;
  }

  getDoubleDiceCounter(){
    let returnClass = '';
    switch (this.gameService.players[this.gameService.turn].prison.doubleDiceCounter) {
      case 1:
        returnClass = 'double_one';
        break;
      case 2:
        returnClass = 'double_two';
        break;
    
      default:
        break;
    }
    return returnClass;
  }

  resizeCanvas(event:any){
    event.renderer.setSize( window.innerWidth, window.innerHeight );
    event.renderer.setPixelRatio(window.devicePixelRatio);
  }

  canSaveThemes(){
    return this.gameService.themes.find((theme:any) => theme.new) ? false : true;
  }

  changeView(type:string){
    switch (type) {
      case 'isometric':
        if(this.gameService.userDevice.includes('phone')){
          this.gameService.setCameraOnPlayer(0); //On phone the camera should follow the player on isometric view
        }else{
          this.gameService.setCameraPosition([-10,10,-10], [8,0,8], 1000, true);
        }
        this.gameService.cameraZoom = 1.2;
        break;
      case 'top-down':
        this.gameService.setCameraPosition([11,50,7], [11,1,9], 1000, true);
        this.gameService.cameraZoom = this.gameService.userDevice.includes('phone')? 0.55 : 0.8;
        break;
    
      default:
        break;
    }
    this.gameService.setCameraZoom();
  }

  calculateDicesInitialPos(){
    //Calculate dices start position / rotation / force
    for (let i = 0; i < this.gamePhysicsService.diceCounter ; i++) {
      const startPosition = {
        x : Math.round(Math.random() * 15 + 2),
        y : Math.round((Math.random() * (!this.gameService.amIOnline() ? 15 : 20)) + 10),
        z : Math.round(Math.random() * 15 + 3)
      }

      const startRotation = {
        x : 2 * Math.PI * Math.random(),
        y : 0,
        z : 2 * Math.PI * Math.random()
      }
      const startForce = 3 * Math.random();

      this.gamePhysicsService.diceStartingFields[i] = {
        startPosition : startPosition,
        startRotation : startRotation,
        startForce : startForce,
        diceI : i,
      }

      //If i'm online and its my turn then send dices initial position to other players
      if(this.gameService.amIOnline() && this.gameService.itsMyTurn){
        this.gameService.setOnlineData$.next({path: '/online/message/', value : {type : MessageTypes.DICE_ROLL, data : {
          startPosition : startPosition,
          startRotation : startRotation,
          startForce : startForce,
          diceI : i,
        }}})
      }

    }

    if(!this.gameService.amIOnline()){
      this.gameService.startToDice = true;
    }
  }

  ngOnDestroy(){
    this.subscriptions.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
