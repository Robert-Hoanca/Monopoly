import { animate, keyframes, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GamePhysicsService } from 'src/app/game-physics.service';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three'
//import {Sky} from '../../../assets/jsImports/Sky.js'

//const Sky = require('three-sky');
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

  actualPlayerProps:Array<any> = [];

  openTextDialog$: Subscription | undefined;
  textDialog:string='';
  cardChangedCounter:number = 0;
  cardOutlineChangedCounter:number = 0;
  rendererOptions:any={
    shadowMap:{
    },
    antialias: true,
  }

  constructor(public gameService: GameService,private dialog: MatDialog , public gamePhysicsService : GamePhysicsService) { }

  ngOnInit(): void {
    this.gameService.addingRemovingMoneyProps();
  }
  ngAfterViewInit(){
    this.gameService.camera = this.camera;
    this.gameService.cameraControls = this.cameraControls;
    this.gameService.setCameraPosition(this.camera, this.gameService.players[this.gameService.turn].pawn.position[0],this.gameService.players[this.gameService.turn].pawn.position[1],this.gameService.players[this.gameService.turn].pawn.position[2], 2500, 5, false)   
    //this.activateLocalSave();
    this.gameService.gameScene = this.scene._objRef;
    this.gamePhysicsService.initWorld();
    this.gamePhysicsService.showDiceResultDialogRef = this.showDiceResultDialogRef;
    //this.gameService.getChestChance('chance');

   /*this.gameService.textDialog({
      title: "Advance to Trafalgar Square - If you pass Go, collect $200",
      action: "move",
      tileid: "trafalgarsquare",
      cardIndex: 11
    },'chance');*/
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
    }, 10000);
  }
  getActualPlayerProps(){
    return this.gameService.sortProperties(this.gameService.gameTable.cards.filter((card: { owner: any; }) => card.owner == this.gameService.players[this.gameService.turn].id));
  }

  resizeCanvas(event:any){

  }

  onBeforeRender(element:any){
    return element; 
  }

  tryToGoNextTurn(){
    if(this.gameService.amountDebt!=0){
      if(this.gameService.debtWithWho == 'player'){
        this.gameService.textDialog({text:this.gameService.players[this.gameService.turn].name + ' have to pay ' + this.gameService.amountDebt + ' of debts to ' + this.gameService.players.find(player => player.id == this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)].owner).name, property: this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)],amountDebt:this.gameService.amountDebt, playerRent:true, debtWithWho: this.gameService.debtWithWho}, 'payMoney');
    
      }else if(this.gameService.debtWithWho == 'bank'){
        this.gameService.textDialog({text:(this.gameService.players[this.gameService.turn].name) + ' have to pay ' + this.gameService.amountDebt + ' of debts to the bank.',debtWithWho: this.gameService.debtWithWho,amountDebt:this.gameService.amountDebt, playerRent:false, playerId:''}, 'payMoney');

      }
    }else{
      this.gameService.nextTurn()
    }

   
  }
  changeCardColor(){
    let color = new THREE.Color( this.gameService.sessionColor )
    this.scene.objRef.children.forEach((child:any) => {
      if( child.name.includes('cardNumber') && this.cardChangedCounter < this.gameService.gameTable.cards.length){
        child.traverse((child:any) => {
          if(child.isMesh ){
            const material = new THREE.MeshBasicMaterial({color: this.gameService.LightenDarkenColor(this.gameService.sessionColor, -20)});
            child.material = material
            this.cardChangedCounter++;
          }
        })
      }else if( child.name.includes('cardOutline') && this.cardOutlineChangedCounter < this.gameService.gameTable.cards.length){
        child.traverse((child:any) => {
          if(child.isMesh ){
            const material = new THREE.MeshBasicMaterial({color: this.gameService.LightenDarkenColor(this.gameService.sessionColor, -40), side: THREE.BackSide});
            child.material = material
            this.cardOutlineChangedCounter++;
          }
        })
      }
    });
  }

  async rollTheDice(){
    //setcamera position on the corner opposite the start
    await this.gameService.setCameraPosition(this.gameService.camera, 25,15,25,1000,5, false,'diceRoll')

    if(this.gameService.startToDice){
      this.gameService.startToDice = false;
    }
    if(!this.gameService.players[this.gameService.turn].prison.inPrison){
      this.gameService.startToDice = true;
      this.gamePhysicsService.diceArray.forEach(dice => {
        this.gamePhysicsService.diceRoll(dice);
      });
     
    }else{
     this.whatToDoInPrison('prisonRoll')
    }
  }

  whatToDoInPrison(action:string){
    if(action == 'payToExit'){
      this.gameService.exitFromPrison(true, false);
    }if(action == 'freeExit'){
      this.gameService.exitFromPrison(false, false);
    }else if(action == 'prisonRoll'){
      this.gameService.startToDice = true;
      this.gamePhysicsService.diceArray.forEach(dice => {
        this.gamePhysicsService.diceRoll(dice);
      });
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
}
