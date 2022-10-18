import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { Scene } from 'three';@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('cardInfo', { static: true }) cardInfo:any;
  @ViewChild('scene', { static: true }) scene:any;

  rendererOptions:object={
    shadowMapType: THREE.VSMShadowMap ,
    antialias: true,
  }

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }
  ngAfterViewInit(){
    
  //const Sky = require('three-sky');

   // const sky = new Sky()
   // sky.scale.setScalar( 450000 );

   // this.scene.objRef.children.push( sky );
  // console.log("scene: ", this.scene)
  }

  resizeCanvas(event:any){

  }

  onBeforeRender(element:any){

    return element; 
  }
}
