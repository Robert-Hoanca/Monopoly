import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { Vector3 } from 'three';
import gsap from 'gsap'
import { json } from 'stream/consumers';
import { count } from 'console';
import { parse } from 'path';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() player:any;
  @ViewChild('playerRef', { static: true }) playerRef:any;
  playerPosition: Vector3 | any;
  setPlayerPosition$: Subscription | undefined;
  playerHasRotate:boolean = false;
  playerIsGoingBack:boolean = false;
  playerArrived:boolean = false;
  gameTableSides:Array<string> = [
    'x', 'z', 'x', 'z'
  ];

  constructor(public gameService: GameService) { }

  async ngOnInit() {
    this.setPlayerPosition(this.player.pawn.position,true);
    this.setPlayerPosition$ = this.gameService.setPlayerPosition$.subscribe((data:any) =>{
      if(this.playerArrived){
        this.playerArrived = false;
      }
      if(this.player.id == this.gameService.players[this.gameService.turn].id){
        if((this.gameService.randomChance && this.gameService.randomChance.count != undefined) || (this.gameService.randomChest && this.gameService.randomChest != undefined)){
          this.setPlayerPosition(data.cardPosition, false ,data.oldCardPosition, true)
        }else{
          this.setPlayerPosition(data.cardPosition, false ,data.oldCardPosition)
        }
      }
    })
  }
  async ngAfterViewInit(){
    setTimeout(() => {
      this.rotatePlayer(this.player.pawn.rotation[1], false);
    }, 500);
  }

  ngOnDestroy(){
    this.setPlayerPosition$?.unsubscribe();
  }

  async setPlayerPosition(position:any, noAnimation?:boolean ,oldCardPosition?:number, goBack? :boolean){
    position = JSON.parse(JSON.stringify(position))
    let actualCardPosition = JSON.parse(JSON.stringify(this.gameService.players[this.gameService.turn].actualCard))
    if(noAnimation){
      this.playerRef._objRef.position.x = position[0];
      this.playerRef._objRef.position.z = position[2];
    }else{
      if(oldCardPosition != undefined){

        let actualSide = 0;
        let toGoSide = 0;
        
        if(actualCardPosition >= 30 && actualCardPosition <=39){
          toGoSide = 3;
        }else if(actualCardPosition >= 20 && actualCardPosition <=30){
          toGoSide = 2;
        }else if(actualCardPosition > 10 && actualCardPosition <30){
          toGoSide = 1;
        }else if(actualCardPosition >= 0 && actualCardPosition <=10){
          toGoSide = 0;
        }

        if(oldCardPosition >= 30  && oldCardPosition <= 39){
          actualSide = 3;
        }else if(oldCardPosition >= 20  && oldCardPosition <= 30){
          actualSide = 2;
        }else if(oldCardPosition >=10 && oldCardPosition <= 20){
          actualSide = 1;
        }else if(oldCardPosition >= 0 && oldCardPosition <=10){
          actualSide = 0;
        }
        if(!goBack){
          if(actualSide === toGoSide){
            if(oldCardPosition < actualCardPosition){
              await this.movePlayerGsap(position, actualSide, oldCardPosition)
            }else {
              if(actualSide === 3){
                await this.movePlayerGsap([0,0,0], 3,oldCardPosition);
              }else{
                await this.cycleMap(actualSide, oldCardPosition , 3 , 3 , [0,0,0])
              }
              actualSide = 0;
              await this.cycleMap(actualSide, oldCardPosition , toGoSide , toGoSide , position)
            }
          }else if(actualSide < toGoSide){
            await this.cycleMap(actualSide, oldCardPosition , toGoSide , toGoSide , position)
          }else if(actualSide > toGoSide){
            if(actualSide === 3){
              await this.movePlayerGsap([0,0,0], 3,oldCardPosition);
            }else{
              await this.cycleMap(actualSide, oldCardPosition , 3 , 3 , [0,0,0])
            }
            actualSide = 0;
            await this.cycleMap(actualSide, oldCardPosition , toGoSide , toGoSide , position)
          }
        }else if(goBack){
            if((actualSide === toGoSide && oldCardPosition > actualCardPosition) || actualSide > toGoSide){
              await this.cycleMap(actualSide, oldCardPosition , toGoSide , toGoSide , position, true)
            }else if(actualSide < toGoSide || ((actualSide === toGoSide && oldCardPosition < actualCardPosition))){
              //Dalla posizione in cui mi trovo fino a 0
                await this.cycleMap(actualSide, oldCardPosition , 0 , 0 , [0,0,0], true)
              //Set actualcard a 0
                actualSide = 3;
              //Dalla posizione 3 alla posizione in cui devo andare
                  await this.cycleMap(actualSide, oldCardPosition , toGoSide , toGoSide , position, true)
            }
        }
        this.gameService.whichPropertyAmI(this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)]);
      }
    }
  }
  async movePlayerGsap(position:any ,index:number, oldCardPosition:number){
    this.gameService.movingCamera = true;
    //Based on given axis, move the player animating it using gsap library
    let shouldGoBack = (this.gameService.randomChance && this.gameService.randomChance.count !== undefined ) || (this.gameService.randomChest && this.gameService.randomChest.count !== undefined) ? true : false;
    if(shouldGoBack && !this.playerIsGoingBack){
      this.playerIsGoingBack = true;
      await this.choosePlayerRotation(true, false);
      this.playerHasRotate = false;
    }
    if(this.gameTableSides[index] == 'x' && !this.playerArrived){
      //Save player position
      let playerPos = parseFloat(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x)).toFixed(1))
      //If player wasn't moving when this function is called, then take the player to the center of the card and prepare it to move
      let confrontatePosition:boolean = false;
      if(oldCardPosition < 20 && !shouldGoBack){
        confrontatePosition = Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x))) < Math.round(position[0])
      }else{
        if(Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x))) > Math.round(position[0])){
          confrontatePosition = Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x))) > Math.round(position[0]);
        }else if(Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x))) < Math.round(position[0])) {
          confrontatePosition = Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x))) < Math.round(position[0]);
        }
      }
      if(!this.gameService.movingPlayer && confrontatePosition){
        let amountOfDistance = await this.setPlayerPositionToCenter('x', oldCardPosition < 20 ? true : false);
        playerPos += amountOfDistance;
        this.gameService.movingPlayer = true;
      }
      
      //Calculate the amount of cards that the player should pass in
      let counterOfCards = Math.round(Math.round(position[0]) != 22 ? (parseFloat(position[0].toFixed(1)) / 2.2) - (playerPos / 2.2) : (22 / 2.2) - (playerPos / 2.2));

      let xIndex = 0;
      for ((counterOfCards > 0 ? xIndex = 1 : xIndex = -1); (counterOfCards > 0 ? xIndex <= Math.round(counterOfCards) : xIndex >= Math.round(counterOfCards)) ;(counterOfCards > 0 ? xIndex++ : xIndex--)) {
        //this.gameService.setCameraPosition(this.gameService.camera, playerPos +  parseFloat(( xIndex * 2.2).toFixed(1)), position[1], position[2],800,5, true, 'x');
        let shouldJump : boolean = false;
        let anotherPlayerOffset:number = 0;
        if(xIndex === Math.round(counterOfCards) || xIndex === 1 || xIndex === -1){
          anotherPlayerOffset = this.movePlayerFromBeingOverAnother('x', playerPos ,  xIndex, counterOfCards, position);
        }
        await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + anotherPlayerOffset, duration: 0.8, ease: 'ease-out' ,  onUpdate: (currentValue) => {
          //Check if player has reached the start cell and call the function.
          if ((this.playerRef._objRef.position.x == 0 && this.playerRef._objRef.position.z == 0) && oldCardPosition!=0 && !this.gameService.players[this.gameService.turn].addingMoney && !this.gameService.players[this.gameService.turn].removingMoney) {
            this.gameService.playerPassedStart()
          }
          //Check if player has reached one angle of the gameTable, if so rotate the player.
          this.choosePlayerRotation(false, false);
          //Check if the player is in a range in which should jump, if so do it otherwise fall down.
          if((counterOfCards > 0 && this.playerRef._objRef.position.x >= (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) - 2) && this.playerRef._objRef.position.x <= (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) - 1.1) && !shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.x > (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + 1.1) && this.playerRef._objRef.position.x < (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + 2) && !shouldJump)){
            shouldJump = true;
            this.playerJump(true);
          }else if((counterOfCards > 0 && this.playerRef._objRef.position.x > (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) - 1.1) && this.playerRef._objRef.position.x < (playerPos + parseFloat(( xIndex * 2.2).toFixed(1))) && shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.x > (playerPos + parseFloat(( xIndex * 2.2).toFixed(1))) && this.playerRef._objRef.position.x < (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + 1.1) && shouldJump)){
            shouldJump = false;
            this.playerJump(false);
          }
        }},);
        
        this.player.pawn.position[0] = playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + anotherPlayerOffset;
        this.player.pawn.position[2] = JSON.parse(JSON.stringify(this.playerRef._objRef.position.z));
      }
    }else if(this.gameTableSides[index] == 'z' && !this.playerArrived){
      let playerPos = parseFloat(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z)).toFixed(1));
      let confrontatePosition:boolean = false;
      if(oldCardPosition < 20 && !shouldGoBack){
        confrontatePosition = Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z))) < Math.round(position[2]);
      }else{
        if(Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z))) > Math.round(position[2])){
          confrontatePosition = Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z))) > Math.round(position[2]);
        }else if(Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z))) < Math.round(position[2])) {
          confrontatePosition = Math.round(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z))) < Math.round(position[2]);
        }
      }
      if(!this.gameService.movingPlayer && confrontatePosition){
        let amountOfDistance = await this.setPlayerPositionToCenter('z', oldCardPosition < 20 ? true : false);
        playerPos += amountOfDistance;
        this.gameService.movingPlayer = true;
      }
      
      let counterOfCards = Math.round(Math.round(position[2]) != 22 ? (parseFloat(position[2].toFixed(1)) / 2.2) - (playerPos / 2.2) : (22 / 2.2) - (playerPos / 2.2));
      let zIndex = 0;
      for ((counterOfCards > 0 ? zIndex = 1 : zIndex = -1); (counterOfCards > 0 ? zIndex <= Math.round(counterOfCards) : zIndex >= Math.round(counterOfCards)) ;(counterOfCards > 0 ? zIndex++ : zIndex--)) {
        //this.gameService.setCameraPosition(this.gameService.camera, position[0] , position[1], playerPos +  parseFloat(( zIndex * 2.2).toFixed(1)),800,5, true, 'z');
        let shouldJump : boolean = false;
        let anotherPlayerOffset:number = 0;
        if(zIndex === Math.round(counterOfCards) || zIndex === 1 || zIndex === -1){
          anotherPlayerOffset = this.movePlayerFromBeingOverAnother('z', playerPos , zIndex, counterOfCards, position);
        }
        await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + anotherPlayerOffset, duration: 0.8, ease: 'ease-out' ,  onUpdate: (currentValue) => {
          if ((this.playerRef._objRef.position.x == 0 && this.playerRef._objRef.position.z == 0) && oldCardPosition!=0 && !this.gameService.players[this.gameService.turn].addingMoney && !this.gameService.players[this.gameService.turn].removingMoney) {
            this.gameService.playerPassedStart()
          }
          this.choosePlayerRotation(false, false)
          if((counterOfCards > 0 && this.playerRef._objRef.position.z >= (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) - 2) && this.playerRef._objRef.position.z <= (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) - 1.1) && !shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.z > (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + 1.1) && this.playerRef._objRef.position.z < (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + 2) && !shouldJump)){
            shouldJump = true;
            this.playerJump(true);
          }else if((counterOfCards > 0 && this.playerRef._objRef.position.z > (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) - 1.1) && this.playerRef._objRef.position.z < (playerPos + parseFloat(( zIndex * 2.2).toFixed(1))) && shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.z > (playerPos + parseFloat(( zIndex * 2.2).toFixed(1))) && this.playerRef._objRef.position.z < (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + 1.1) && shouldJump)){
            shouldJump = false;
            this.playerJump(false);
          }
        }},);
        
        this.player.pawn.position[0] = JSON.parse(JSON.stringify(this.playerRef._objRef.position.x));
        this.player.pawn.position[2] = playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + anotherPlayerOffset;
      }
    }else{
    this.gameService.movingCamera = false;
    }
    this.playerHasRotate = false;
  }

   async choosePlayerRotation(rotateBack:boolean, rotateforward:boolean){
    if(!this.playerHasRotate){
      let rotationValue = 0;
      if(rotateBack || rotateforward){
        rotationValue = JSON.parse(JSON.stringify(this.playerRef._objRef.rotation.y)) + (rotateBack ? (3.14 ) : ( -3.14));
        this.playerHasRotate = true;
      }
      if((this.playerRef._objRef.position.x >= 0 && this.playerRef._objRef.position.x < 1) && (this.playerRef._objRef.position.z >= 0 && this.playerRef._objRef.position.z < 1) && (this.player.pawn.rotationSide === 3 && !this.playerIsGoingBack || (this.player.pawn.rotationSide === 0 && this.playerIsGoingBack))){
        this.playerHasRotate = true;
        this.player.pawn.rotationSide = this.playerIsGoingBack ? 3 : 0;
        rotationValue = this.playerRef._objRef.rotation.y + (this.playerIsGoingBack ? ( 1.57) : (-1.57));
      }else if((this.playerRef._objRef.position.x > 21 && this.playerRef._objRef.position.x < 23) && (this.playerRef._objRef.position.z > 0 && this.playerRef._objRef.position.z < 1) && ((this.player.pawn.rotationSide === 0 && !this.playerIsGoingBack) || (this.player.pawn.rotationSide === 1 && this.playerIsGoingBack))){
        this.playerHasRotate = true;
        this.player.pawn.rotationSide = this.playerIsGoingBack ? 0 : 1;
        rotationValue = this.playerRef._objRef.rotation.y + (this.playerIsGoingBack ? ( 1.57) : (-1.57));
      }else if((this.playerRef._objRef.position.x > 21 && this.playerRef._objRef.position.x < 23) && (this.playerRef._objRef.position.z > 21 && this.playerRef._objRef.position.z < 23) && ((this.player.pawn.rotationSide === 1 && !this.playerIsGoingBack) || (this.player.pawn.rotationSide === 2 && this.playerIsGoingBack)) && !this.playerArrived){
        this.playerHasRotate = true;
        this.player.pawn.rotationSide = this.playerIsGoingBack ? 1 : 2;
        rotationValue = this.playerRef._objRef.rotation.y + (this.playerIsGoingBack ? ( 1.57) : (-1.57));
      }else if((this.playerRef._objRef.position.x >= 0 && this.playerRef._objRef.position.x < 1) && (this.playerRef._objRef.position.z > 21 && this.playerRef._objRef.position.z < 23)  && ((this.player.pawn.rotationSide === 2 && !this.playerIsGoingBack) || (this.player.pawn.rotationSide === 3 && this.playerIsGoingBack))){
        this.playerHasRotate = true;
        this.player.pawn.rotationSide = this.playerIsGoingBack ? 2 : 3;
        rotationValue = this.playerRef._objRef.rotation.y + (this.playerIsGoingBack ? (1.57) : (-1.57));
      }
      if(this.playerRef._objRef.rotation.y != rotationValue && this.playerHasRotate){
        await this.rotatePlayer(rotationValue, true)
        this.player.pawn.rotation = [0, rotationValue ,0];
      }
    }
  }

  async rotatePlayer(value: number, animation:boolean){
    if(animation){
      await gsap.fromTo(this.playerRef._objRef.rotation, {y: this.playerRef._objRef.rotation.y}, {y: value, duration: 0.5});
    }else{
      //gsap.fromTo(this.playerRef._objRef.rotation, {y: this.playerRef._objRef.rotation.y}, {y: value});
      this.playerRef._objRef.rotation.y = value;
    }
  }

  async cycleMap(actualSide:number, oldCardPosition:number, indexCheckNum:number, indexMinusNum:number ,  finalPosition:Array<number>, goBack?:boolean){
    if(!goBack){
      for (let index = actualSide; index <= (indexMinusNum); index++) {
        if(index < indexCheckNum){
          await this.movePlayerGsap([(index == 0 || index == 1 ? 22 : 0), 0 , (index == 1 || index == 2 ? 22 : 0)], index,oldCardPosition);
        }else{
          await this.movePlayerGsap(finalPosition, index,oldCardPosition);
        }
      }
    }else if(goBack){
      for (let index = actualSide; index >= (indexMinusNum); index--) {
        if(index > indexCheckNum){
          await this.movePlayerGsap([(index == 2 || index == 1 ? 22 : 0), 0 , (index == 2 || index == 3 ? 22 : 0)], index,oldCardPosition);
        }else{
          await this.movePlayerGsap(finalPosition, index,oldCardPosition);
        }
      }
    }
  }

  playerJump(shouldJump:boolean){
    gsap.fromTo(this.playerRef._objRef.position, {y: this.playerRef._objRef.position.y}, {y: shouldJump ? 1 : 0 , ease: 'ease-out'})
  }

  calculatePassedCards(position:Array<number>){
    let passedCards = 0;
    position = JSON.parse(JSON.stringify(position))
    if(Math.round(position[0] / 2.2) <= 10 && Math.round(position[2] / 2.2) == 0){
      passedCards = 0 + Math.round(position[0] / 2.2);
    }else if(Math.round(position[0] / 2.2) === 10 && Math.round(position[2] / 2.2) > 0){
      passedCards = 10 + (Math.round((position[2]) / 2.2))
    }else if(Math.round(position[2] / 2.2) === 10 && Math.round(position[0] / 2.2) > 0){
      passedCards = 20 + (Math.round((22 - position[0]) / 2.2))
    }else if(Math.round(position[0] / 2.2) === 0 && Math.round(position[2] / 2.2) > 0){
      passedCards = 30 + (Math.round((22 - position[2]) / 2.2));
    }
    return passedCards
  }

  movePlayerFromBeingOverAnother(axis:string , playerPos:number ,index:number, counterOfCards:number, position:Array<number>){
    //Calculate in which cell should the player go at the end of this function
    position = JSON.parse(JSON.stringify(position))
    let passedCards = this.calculatePassedCards(position);
    let playerFinalPosIsPositive = this.player.actualCard >= 20 ? false : true; 
    let goingBack = (this.gameService.randomChance && this.gameService.randomChance.count !== undefined ) || (this.gameService.randomChest && this.gameService.randomChest.count !== undefined) ? true : false;

    //If the player has arrived at the destination then place it in one of the four sections of a card
    if(index === counterOfCards && (passedCards === this.player.actualCard)){
      this.gameService.movingPlayer = false;
      this.gameService.movingCamera = false;
      this.playerArrived = true;
      this.playerIsGoingBack = false;
      let finalZNum = 0;
      let finalXNum = 0;
      if(axis === 'x'){
        //          ^                 //          ^ 
        //  |0|3|   |                 //  |2|1|   |
        //  |1|2|   | z               //  |3|0|   | z
        //  <-- x                     // - x -- > 
        if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 0 && player.actualCard === passedCards).length === 0){

          if(passedCards === 10){
            //Final cardPosition === 10
            finalZNum = this.playerRef._objRef.position.z + (0.5);
            finalXNum = -0.5;
          }else if (passedCards === 30){
            //Final cardPosition === 30
            finalZNum = this.playerRef._objRef.position.z + (-0.5)
            finalXNum = 0.5;
          }else{
            finalZNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.z + (0.5) : this.playerRef._objRef.position.z + (-0.5)
            finalXNum = playerFinalPosIsPositive ? 0.5 : -0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 0;
        }else if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 1 && player.actualCard === passedCards).length === 0){
          
          if(passedCards === 10){
            //Final cardPosition === 10
            finalZNum = this.playerRef._objRef.position.z + (0.5);
            finalXNum = 0.5;
          }else{
            finalZNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.z + (-0.5) : this.playerRef._objRef.position.z + (0.5)
            finalXNum = playerFinalPosIsPositive ? 0.5 : -0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 1;
        }else if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 2 && player.actualCard === passedCards).length === 0){
          
          if(passedCards === 10){
            //Final cardPosition === 10
            finalZNum = this.playerRef._objRef.position.z + (-0.5);
            finalXNum = 0.5;
          }else{
            finalZNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.z + (-0.5) : this.playerRef._objRef.position.z + (0.5)
            finalXNum = playerFinalPosIsPositive ? -0.5 : 0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 2;
        }else if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 3 && player.actualCard === passedCards).length === 0){

          if(passedCards === 10){
            //Final cardPosition === 10
            finalZNum = this.playerRef._objRef.position.z + (-0.5);
            finalXNum = -0.5;
          }else{
            finalZNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.z + (0.5) : this.playerRef._objRef.position.z + (-0.5)
            finalXNum = playerFinalPosIsPositive ? -0.5 : 0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 3;
        }
        this.movePlayerGsapNormal('z', finalZNum);
        if(goingBack){
          this.choosePlayerRotation(false , true)
        }
        return finalXNum;
      }else if(axis === 'z'){
        //          ^                 //          | 
        //  |1|0|   |                 //  |3|2|   |
        //  |2|3|   | z               //  |0|1|   v -z
        //  <-- x                     // - x -- > 
        if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 0 && player.actualCard === passedCards).length === 0){
          if(passedCards === 20){
            //Final cardPosition === 20
            finalXNum = this.playerRef._objRef.position.x + (-0.5);
            finalZNum = -0.5;
          }else if(passedCards === 0){
            //Final cardPosition === 0
            finalXNum = this.playerRef._objRef.position.x + (0.5);
            finalZNum = 0.5;
          }else{
            finalXNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.x + (-0.5) : this.playerRef._objRef.position.x + (0.5)
            finalZNum = playerFinalPosIsPositive ? 0.5 : -0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 0;
        }else if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 1 && player.actualCard === passedCards).length === 0){
          if(passedCards === 20){
            //Final cardPosition === 20
            finalXNum = this.playerRef._objRef.position.x + (-0.5);
            finalZNum = 0.5;
          }else if(passedCards === 0){
            //Final cardPosition === 0
            finalXNum = this.playerRef._objRef.position.x + (0.5);
            finalZNum = -0.5;
          }else{
            finalXNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.x + (0.5) : this.playerRef._objRef.position.x + (-0.5)
            finalZNum = playerFinalPosIsPositive ? 0.5 : -0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 1
        }else if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 2 && player.actualCard === passedCards).length === 0){
          if(passedCards === 20){
            //Final cardPosition === 20
            finalXNum = this.playerRef._objRef.position.x + (0.5);
            finalZNum = 0.5;
          }else if(passedCards === 0){
            //Final cardPosition === 20
            finalXNum = this.playerRef._objRef.position.x + (-0.5);
            finalZNum = -0.5;
          }else{
            finalXNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.x + (0.5) : this.playerRef._objRef.position.x + (-0.5)
            finalZNum = playerFinalPosIsPositive ? -0.5 : 0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 2;
        }else if(this.gameService.players.filter(player => player.id != this.player.id && player.pawn.cardSection === 3 && player.actualCard === passedCards).length === 0){
          if(passedCards === 20){
            //Final cardPosition === 20
            finalXNum = this.playerRef._objRef.position.x + (0.5);
            finalZNum = -0.5;
          }else if(passedCards === 0){
            //Final cardPosition === 20
            finalXNum = this.playerRef._objRef.position.x + (-0.5);
            finalZNum = 0.5;
          }else{
            finalXNum = playerFinalPosIsPositive ? this.playerRef._objRef.position.x + (-0.5) : this.playerRef._objRef.position.x + (0.5)
            finalZNum = playerFinalPosIsPositive ? -0.5 : 0.5;
          }
          this.gameService.players[this.gameService.turn].pawn.cardSection = 3;
        }
        this.movePlayerGsapNormal('x', finalXNum);
        if(goingBack){
          this.choosePlayerRotation(false , true)
        }
        return finalZNum;
      }  
      return 0;
      
    }else if(counterOfCards > 0 ? (index < counterOfCards) : (index > counterOfCards)){
      //If the player hasn't arrived yet && if the player is not in the center, center the player position on the card.
      if(!this.gameService.movingPlayer){
        this.setPlayerPositionToCenter(axis, playerFinalPosIsPositive);
       // return valueToReturn;
      }
      return 0;
    }else{
      return 0;
    }
  }

  async movePlayerGsapNormal(axis:string, value:number){
    if(axis === 'x'){
      await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: value , ease: 'ease-out'})
    }else if(axis === 'z'){
      await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: value , ease: 'ease-out'})
    }
  }

  async setPlayerPositionToCenter(axis:string, isPositive:boolean){
    if(axis === 'x'){
      switch (this.player.pawn.cardSection) {
        case 0:
          await this.movePlayerGsapNormal('z', isPositive ? this.playerRef._objRef.position.z - 0.5 : this.playerRef._objRef.position.z + 0.5);
          return isPositive ? -0.5 : 0.5;
        case 1:
          await this.movePlayerGsapNormal('z', isPositive ? this.playerRef._objRef.position.z + 0.5 : this.playerRef._objRef.position.z - 0.5);
          return isPositive ? -0.5 : 0.5;
        case 2:
          await this.movePlayerGsapNormal('z', isPositive ? this.playerRef._objRef.position.z + 0.5 : this.playerRef._objRef.position.z - 0.5);
          return isPositive ? 0.5 : -0.5;
        case 3:
          await this.movePlayerGsapNormal('z', isPositive ? this.playerRef._objRef.position.z - 0.5 : this.playerRef._objRef.position.z + 0.5);
          return isPositive ? 0.5 : -0.5;
        default:
          return 0;
      }
    }else if(axis === 'z'){
      switch (this.player.pawn.cardSection) {
        case 0:
          await this.movePlayerGsapNormal('x', isPositive ? this.playerRef._objRef.position.x + 0.5 : this.playerRef._objRef.position.x - 0.5);
          return isPositive ? -0.5 : 0.5;
        case 1:
          await this.movePlayerGsapNormal('x', isPositive ? this.playerRef._objRef.position.x - 0.5 : this.playerRef._objRef.position.x + 0.5);
          return isPositive ? -0.5 : 0.5;
        case 2:
          await this.movePlayerGsapNormal('x', isPositive ? this.playerRef._objRef.position.x - 0.5 : this.playerRef._objRef.position.x + 0.5);
          return isPositive ? 0.5 : -0.5;
        case 3:
          await this.movePlayerGsapNormal('x', isPositive ? this.playerRef._objRef.position.x + 0.5 : this.playerRef._objRef.position.x - 0.5);
          return isPositive ? 0.5 : -0.5;
          default:
            return 0;
      }
    }else{
      return 0
    }
  }
}
