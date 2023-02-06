
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GLTFLoaderService } from 'ngx-three';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import gsap from 'gsap'
import { setTimeout } from 'timers';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: any;
  @Input() cardIndex!: any;
  @Input() scene!: any;

  url:string='';

  position: [x: number, y: number, z: number] = [0, 0, 0];
  rotation: [x: number, y: number, z: number] = [0, 0, 0];
  carpetPosistion: [x: number, y: number, z: number] = [0, 0, 0];
  
  meshColor:string='#ffff00';
  getCardPosition$: Subscription | undefined;
  castedShadow:boolean=false;
  fontLoader = new FontLoader();
  @ViewChild('cardRef', { static: true }) cardRef:any;
  @ViewChild('cardOutlineRef', { static: true }) cardOutlineRef:any;
  @ViewChild('carpetRef', { static: true }) carpetRef:any;
  //@ViewChild('decorationRef', { static: true }) decorationRef:any;

  
  
  constructor( public gameService: GameService,private service: GLTFLoaderService ) { }

  async ngOnInit() {
    this.url= (this.cardIndex/10) % 1 == 0 ? '/assets/blenderModels/card/definitiveCard/card.gltf':'/assets/blenderModels/card/definitiveCard/card.gltf';
    this.setCardPosition();
    this.setCarpetPosition();
    this.getCardPosition$ = this.gameService.getCardPosition$.subscribe((diceNumber:any) =>{
      if(diceNumber == this.cardIndex){
        this.gameService.setPlayerPosition(this.position, diceNumber);
      }
    });
  }

  ngAfterViewInit(){
  }
  setCardPosition(){
    if( this.cardIndex==11 || this.cardIndex==21 || this.cardIndex==31){
      this.gameService.cardsPositionCounter = 0;
      this.gameService.cardsPositionCounter += 2.2;
    }

    if(this.cardIndex <= 10){
      this.position = [ this.gameService.cardsPositionCounter,0,0];
      if(this.cardIndex == 0){
        this.position = [0,0,0];
      }
    }else  if(10 < this.cardIndex && this.cardIndex <= 20){
      this.position = [22,0,this.gameService.cardsPositionCounter];
      this.rotation = [0,(Math.PI / 2),0]
    }else  if(20 < this.cardIndex && this.cardIndex <= 30){
      this.position = [(22 - this.gameService.cardsPositionCounter),0,22];
    }else  if(30 < this.cardIndex && this.cardIndex <= 40){
      this.position = [0,0,(22-this.gameService.cardsPositionCounter)];
      this.rotation = [0,(Math.PI / 2),0];
    }
    this.gameService.cardsPositionCounter += 2.2;
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

  returnSpecialCardUrl(cardType:string){
    let url = '';
    switch (cardType) {
      case 'start':
        url = '/assets/blenderModels/card/definitiveCard/startFlag.gltf'
        break;
      case 'prison':
        url = '/assets/blenderModels/card/definitiveCard/prisonCage.gltf'
        break;
      case 'parkArea':
        url = '/assets/blenderModels/card/definitiveCard/parkingArea.gltf'
        break;
    }
    return url;
  }
  hoverCard(type:string){
   //this.scaleAnimation()
    //this.position[1] = type == 'enter' ? this.position[1] + 0.2 : this.position[1] -0.2;
  }

  test(){
    console.log(this.cardRef._objRef.position, this.cardRef)
  }

  /* async scaleAnimation(){
    this.cardRef._objRef.scale.x = 0;
    this.cardRef._objRef.scale.y = 0;
    this.cardRef._objRef.scale.z = 0;

    this.cardOutlineRef._objRef.scale.x = 0;
    this.cardOutlineRef._objRef.scale.y = 0;
    this.cardOutlineRef._objRef.scale.z = 0;

    await gsap.fromTo(this.cardOutlineRef._objRef.scale, {y: this.cardOutlineRef._objRef.scale.y}, {y: 1.1, duration: 0.5});
    await gsap.fromTo(this.cardOutlineRef._objRef.scale, {x: this.cardOutlineRef._objRef.scale.x}, {x: 1.1, duration: 0.5});
    await gsap.fromTo(this.cardOutlineRef._objRef.scale, {z: this.cardOutlineRef._objRef.scale.z}, {z: 1.1, duration: 0.5});
    
    await gsap.fromTo(this.cardRef._objRef.scale, {y: this.cardRef._objRef.scale.y}, {y: 1, duration: 0.2});
    await gsap.fromTo(this.cardRef._objRef.scale, {x: this.cardRef._objRef.scale.x}, {x: 1, duration: 0.2});
    await  gsap.fromTo(this.cardRef._objRef.scale, {z: this.cardRef._objRef.scale.z}, {z: 1, duration: 0.2});


  }*/
}
