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
  @ViewChild('scene', { static: true }) scene:any;
  actualPlayerProps:Array<any> = [];

  rendererOptions:object={
    shadowMapType: THREE.VSMShadowMap ,
    antialias: true,
  }

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    //let Sky = require('../../../assets/jsImports/Sky.js')
    //const sky =   new Sky();
    //console.log("sky", sky);
  }
  ngAfterViewInit(){
   // const sky = new Sky()
   // sky.scale.setScalar( 450000 );

   // this.scene.objRef.children.push( sky );
  // console.log("scene: ", this.scene)
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
