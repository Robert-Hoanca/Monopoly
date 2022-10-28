import { Component, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('light', { static: true }) light:any;
  @ViewChild('ambientLight', { static: true }) ambientLight:any;
  actualPlayerProps:Array<any> = [];

  //ADD OBJECTS TO SCENE
  //this.scene.objRef.children.push( OBJECT );
  rendererOptions:any={
    /*shadowMap:{
      enabled:true,
      type:THREE.BasicShadowMap
    },*/
    antialias: true,
    outputEncoding: 3001,
    toneMapping:THREE.CineonToneMapping //THREE.ACESFilmicToneMapping
  }

  constructor(public gameService: GameService ) { }

  ngOnInit(): void {
    //let Sky = require('../../../assets/jsImports/Sky.js')
    //const sky =   new Sky();
    //console.log("sky", sky);

   
  }
  ngAfterViewInit(){
     //SetUp lights and shadow values
     this.light.objRef.shadow.bias = -0.0009;//-0.0005
     this.light.objRef.intensity=3;//2
     this.ambientLight.objRef.intensity=2;//1

     console.log(this.canvas)

    // renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;


     //const helper = new THREE.CameraHelper( this.camera.objRef );
     
     this.light.objRef.shadowMapHeight=2048; 
     this.light.objRefshadowMapWidth=2048;
     this.light.objRefshadowCameraLeft= -50;  
     this.light.objRefshadowCameraRight= 50;
     this.light.objRefshadowCameraBottom= -50; 
      this.light.objRefshadowCameraTop= 50;


   // const sky = new Sky()
   // sky.scale.setScalar( 450000 );
   // this.scene.objRef.children.push( sky );
  }

  getActualPlayerProps(){
    return this.gameService.gameTable.cards.filter((card: { owner: any; }) => card.owner == this.gameService.actualTurnPlayer.id)
  }

  resizeCanvas(event:any){

  }

  onBeforeRender(element:any){

    return element; 
  }
}
