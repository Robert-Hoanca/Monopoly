import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three'
//import {Sky} from '../../../assets/jsImports/Sky.js'

//const Sky = require('three-sky');
@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('cardInfo', { static: true }) cardInfo:any;

  @ViewChild('canvas', { static: true }) canvas:any;
  @ViewChild('scene', { static: true }) scene:any;

  @ViewChild('camera', { static: true }) camera:any;
  @ViewChild('cameraControls', { static: true }) cameraControls:any;
  
  @ViewChild('light', { static: true }) light:any;
  @ViewChild('ambientLight', { static: true }) ambientLight:any;

  @ViewChild('sky', { static: true }) sky:any;
  @ViewChild('moneyDialog', { static: true }) moneyDialogRef!: TemplateRef<any>;

  actualPlayerProps:Array<any> = [];

  openTextDialog$: Subscription | undefined;
  textDialog:string='';

  //ADD OBJECTS TO SCENE
  //this.scene.objRef.children.push( OBJECT );
  rendererOptions:any={
    /*shadowMap:{
      enabled:true,
      type:THREE.PCFSoftShadowMap,
      autoUpdate:true,
    },*/
    antialias: true,
    outputEncoding: 3001,
    toneMapping:THREE.CineonToneMapping //THREE.ACESFilmicToneMapping
  }

  constructor(public gameService: GameService,private dialog: MatDialog ) { }

  ngOnInit(): void {
    this.openTextDialog$ = this.gameService.openTextDialog$.subscribe((data:any) =>{
      this.openMoneyDialog(data)
    });
  }
  ngAfterViewInit(){
    this.gameService.camera = this.camera;
    this.gameService.setCameraPosition(this.camera, -15,15,-15, 2500)
    this.gameService.cameraControls = this.cameraControls;

     //SetUp lights and shadow values
    this.light.objRef.shadow.normalBias = -0.0005;//-0.0005
    this.light.objRef.shadow.bias = -0.00023; //00023
    this.light.objRef.shadow.radius = 0.30; //0.30
    //this.light.objRef.intensity=3;//2
    //this.ambientLight.objRef.intensity=2;//1
    this.light.objRef.shadowMapHeight=2048; 
    this.light.objRefshadowMapWidth=2048;
    this.light.objRef.shadow.camera.left= -25;  
    this.light.objRef.shadow.camera.right= 25;
    this.light.objRef.shadow.camera.bottom= -25; 
    this.light.objRef.shadow.camera.top= 25;
    this.activateLocalSave();
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
      this.gameService.localSave.fancyGraphics = this.gameService.fancyGraphics;
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

  openMoneyDialog(data:any){
    this.textDialog = data.text;
    this.dialog.open(this.moneyDialogRef);
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

  goBackHome(){
    location.reload();
  }

  enableShadow(){
    this.scene.objRef.children.forEach((child:any) => {
        child.traverse((child:any) => {
          if(child.isMesh && !child.castShadow){
            let color = new THREE.Color( child.material.color.r, child.material.color.g, child.material.color.b )
            const material = new THREE.MeshLambertMaterial({color: color});
            child.castShadow=true;
            child.receiveShadow=true;
            child.material = material
          }
        })
    });
  }
}
