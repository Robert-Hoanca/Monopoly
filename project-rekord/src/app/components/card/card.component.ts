
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GLTFLoaderService } from 'ngx-three';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { setInterval } from 'timers';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: any;
  @Input() cardIndex!: any;
  @Input() scene!: any;

  urlTop:string='';
  urlBottom:string='';

  position: [x: number, y: number, z: number] = [0, 0, 0];
  bottomRotation: [x: number, y: number, z: number] = [0, 0, 0];
  rotation: [x: number, y: number, z: number] = [0, 0, 0];
  carpetPosistion: [x: number, y: number, z: number] = [0, 0, 0];

  possibleHousePositions: Array<any> = [
    1,
    2,
    3,
    4,
  ];
  
  meshColor:string='#ffff00';
  getCardPosition$: Subscription | undefined;
  castedShadow:boolean=false;
  fontLoader = new FontLoader();
  @ViewChild('cardRef', { static: true }) cardRef:any;
  @ViewChild('carpetRef', { static: true }) carpetRef:any;
  constructor( public gameService: GameService,private service: GLTFLoaderService ) { }

  async ngOnInit() {
    //this.url= (this.cardIndex/10) % 1 == 0 ? '/assets/blenderModels/card/islandM.gltf':'/assets/blenderModels/card/islandM.gltf';
    this.urlTop= '/assets/blenderModels/card/island/island.gltf';
    this.urlBottom= '/assets/blenderModels/card/island 2.0/Island_bottom.gltf';
    this.setCardPosition();
    this.setCarpetPosition();
    this.getCardPosition$ = this.gameService.getCardPosition$.subscribe((diceNumber:any) =>{
      if(diceNumber == this.cardIndex){
        this.gameService.setPlayerPosition(this.position, diceNumber);
        //this.gameService.actualTurnPlayer.pawn.position =  this.position;
        //this.gameService.actualTurnPlayer.pawn.position[1] = 0.2;
        //this.gameService.payTaxes(this.cardIndex);
        //this.gameService.cameraPosition = [  (this.gameService.cameraPosition[0] + 0.01), this.gameService.cameraPosition[1], this.position[2]]
      }
    });
  }

  ngAfterViewInit(){
  }

  setCardPosition(){
    this.bottomRotation = [0,(Math.PI / 2)* Math.round(Math.random() * (100 - 1) + 1),0];
    /*if( this.cardIndex==11 || this.cardIndex==21 || this.cardIndex==31){
      this.gameService.cardsPositionCounter = 0;
      this.gameService.cardsPositionCounter += 2.5;
    }
    if(this.cardIndex <= 10){
      this.position = [ this.gameService.cardsPositionCounter,0,0];
      if(this.cardIndex == 0){
        this.position = [ 0,0,0];
      }
    }else  if(10 < this.cardIndex && this.cardIndex <= 20){
      this.position = [21,0,this.gameService.cardsPositionCounter];
      this.rotation = [0,(Math.PI / 2),0]
    }else  if(20 < this.cardIndex && this.cardIndex <= 30){
      this.position = [(21 - this.gameService.cardsPositionCounter),0,21];
    }else  if(30 < this.cardIndex && this.cardIndex <= 40){
      this.position = [0,0,(21-this.gameService.cardsPositionCounter)];
      this.rotation = [0,(Math.PI / 2),0];
    }
    
    if(this.cardIndex == 9 || this.cardIndex == 19 || this.cardIndex == 29 || this.cardIndex == 39){
      this.gameService.cardsPositionCounter += 0.5
    }
    this.gameService.cardsPositionCounter += (this.cardIndex/10) % 1 == 0 ? 2.5 : 2;*/


    if( this.cardIndex==11 || this.cardIndex==21 || this.cardIndex==31){
      this.gameService.cardsPositionCounter = 0;
      this.gameService.cardsPositionCounter += 2;
    }

    if(this.cardIndex <= 10){
      this.position = [ this.gameService.cardsPositionCounter,0,0];
      if(this.cardIndex == 0){
        this.position = [0,0,0];
      }
    }else  if(10 < this.cardIndex && this.cardIndex <= 20){
      this.position = [20,0,this.gameService.cardsPositionCounter];
      this.rotation = [0,(Math.PI / 2),0]
    }else  if(20 < this.cardIndex && this.cardIndex <= 30){
      this.position = [(20 - this.gameService.cardsPositionCounter),0,20];
    }else  if(30 < this.cardIndex && this.cardIndex <= 40){
      this.position = [0,0,(20-this.gameService.cardsPositionCounter)];
      this.rotation = [0,(Math.PI / 2),0];
    }
    this.gameService.cardsPositionCounter += 2;
  }

  choosePossibleHousePosition(){
    let randomIndex = Math.round(Math.random() * ((this.possibleHousePositions.length - 1) - 0) + 0);
    return this.possibleHousePositions[randomIndex];
  }

  loadText(){
    let that=this;
    this.fontLoader.load( 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond&family=Spline+Sans:wght@400;700&display=swap', function (  this: any ,font: any) {

      const geometry = new TextGeometry( 'Hello three.js!', {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
      } );
      geometry.computeBoundingBox();
      const material = new THREE.MeshBasicMaterial();
      
      const cube = new THREE.Mesh( geometry, material );
      cube.position.x = 0;
      cube.position.y = 5;
      cube.position.z = 0;
      this.scene.objRef.children.push(cube)
    } );


  }

  setCarpetPosition(){
    this.carpetPosistion = JSON.parse(JSON.stringify(this.position))
    
    if(this.cardIndex<= 10){
      this.carpetPosistion[2]+=0.8;
    } else if(10 < this.cardIndex && this.cardIndex <= 20){
      this.carpetPosistion[0]-=0.8;
    } else if(20 < this.cardIndex && this.cardIndex <= 30){
      this.carpetPosistion[2]-=0.8;
    }else if(30 < this.cardIndex && this.cardIndex <= 40){
      this.carpetPosistion[0]+=0.8;
    }
    this.carpetPosistion[1]+=0.05;
  }


  test(){
  }
}
