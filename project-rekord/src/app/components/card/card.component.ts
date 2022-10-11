
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GLTFLoaderService } from 'ngx-three';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: any;
  @Input() cardIndex!: any;
  url:string='';
  position: [x: number, y: number, z: number] = [0, 0, 0];
  rotation: [x: number, y: number, z: number] = [0, 0, 0];
  meshColor:string='#ffff00';
  getCardPosition$: Subscription | undefined;
  castedShadow:boolean=false;

  fontLoader = new FontLoader();
  @ViewChild('cardRef', { static: true }) cardRef:any;

  constructor( public gameService: GameService,private service: GLTFLoaderService ) { }

  async ngOnInit() {
    this.url= (this.cardIndex/10) % 1 == 0 ? '/assets/blenderModels/card/card_corner.gltf':'/assets/blenderModels/card/card.gltf';
    this.setCardPosition();
    this.getCardPosition$ = this.gameService.getCardPosition$.subscribe((diceNumber:any) =>{
      if(diceNumber == this.cardIndex){
        this.gameService.actualTurnPlayer.pawn.position =  this.position;
        this.gameService.actualTurnPlayer.pawn.position[1] = 0.2;
        this.gameService.payTaxes(this.cardIndex);
        //this.gameService.cameraPosition = [  (this.gameService.cameraPosition[0] + 0.01), this.gameService.cameraPosition[1], this.position[2]]
      }
    });
  }

  ngAfterViewInit(){
    this.loadText()
  }

  enableShadow(element:any, that:any){
    element.traverse((child:any) => {
      if (child.isMesh && !that.castedShadow) {
        const material = new THREE.MeshStandardMaterial();
        child.castShadow=true;
        child.receiveShadow=true;
        child.material = material;
        that.castedShadow = true;
      }
    })
    return element;
  }

  setCardPosition(){
    if( this.cardIndex==11 || this.cardIndex==21 || this.cardIndex==31){
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
    this.gameService.cardsPositionCounter += (this.cardIndex/10) % 1 == 0 ? 2.5 : 2;
  }

  

  loadText(){
    this.fontLoader.load( 'fonts/helvetiker_regular.typeface.json', function ( font ) {

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
    } );
  }


  test(){
    console.log("card position: ", this.position)
    console.log("card index:", this.cardIndex)
  }
}
