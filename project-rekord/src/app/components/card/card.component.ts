
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
  getCardPosition$: Subscription | undefined;
  @ViewChild('cardRef', { static: true }) cardRef:any;
  @ViewChild('cardOutlineRef', { static: true }) cardOutlineRef:any;
  @ViewChild('carpetRef', { static: true }) carpetRef:any;
  constructor( public gameService: GameService,private service: GLTFLoaderService ) { }

  async ngOnInit() {
    this.url= (this.cardIndex/10) % 1 == 0 ? '/assets/blenderModels/card/definitiveCard/card.gltf':'/assets/blenderModels/card/definitiveCard/card.gltf';
    this.setCardPosition();
    this.setCarpetPosition();
    this.getCardPosition$ = this.gameService.getCardPosition$.subscribe((diceNumber:any) =>{
      if(diceNumber == this.cardIndex){
        this.gameService.setPlayerPosition([this.cardRef._objRef.position.x, this.cardRef._objRef.position.y, this.cardRef._objRef.position.z], diceNumber);
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
      case 'chance':
        url = '/assets/blenderModels/card/definitiveCard/chance.gltf'
        break;
      case 'communityChest':
        url = '/assets/blenderModels/card/definitiveCard/communityChest.gltf'
        break;
      case 'goToPrison':
        url = '/assets/blenderModels/card/definitiveCard/police.gltf'
        break;
      case 'taxes':
        url = '/assets/blenderModels/card/definitiveCard/taxes.gltf'
        break;
    }
    return url;
  }

  returnSpecialCardObjRotation():any{

    if(this.card.cardType=='chance' || this.card.cardType=='communityChest' || this.card.cardType=='taxes'){
      if((this.cardIndex >= 20 && this.cardIndex <= 30) ){
        return [this.rotation[0], -(Math.PI), this.rotation[2]]
      }else if( this.cardIndex >= 10 && this.cardIndex <= 20){
        return [this.rotation[0], -(Math.PI / 2), this.rotation[2]]
      }else{
        return this.rotation;
      }
    }else{
      return [0,0,0];
    }

   
  }
  hoverCard(type:string){
  }

  test(){
    console.log(this.cardRef._objRef.position, this.cardRef)
  }
}
