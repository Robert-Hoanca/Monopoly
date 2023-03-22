import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { Vector3 } from 'three';
import gsap from 'gsap'
import { json } from 'stream/consumers';

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

  gameTableSides:Array<string> = [
    'x', 'z', 'x', 'z'
  ];

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.setPlayerPosition(this.player.pawn.position,true);
    this.setPlayerPosition$ = this.gameService.setPlayerPosition$.subscribe((data:any) =>{
      if(this.player.id == this.gameService.players[this.gameService.turn].id){
        if(this.gameService.randomChance && this.gameService.randomChance.count != undefined || this.gameService.randomChest && this.gameService.randomChest != undefined){
          this.setPlayerPosition(data.cardPosition, false ,data.oldCardPosition, true)
        }else{
          this.setPlayerPosition(data.cardPosition, false ,data.oldCardPosition)
        }
      }
    })
  }
  async ngAfterViewInit(){
  }

  ngOnDestroy(){
    this.setPlayerPosition$?.unsubscribe();
  }

  async setPlayerPosition(position:any, noAnimation?:boolean ,oldCardPosition?:number, goBack? :boolean){
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
        }else{
          if(goBack){
            for (let index = actualSide; index >= toGoSide; index--) {
              await this.movePlayerGsap([index > toGoSide ? (index == 3 || index == 1 ? 0 : 22) : position[0], 0 , index > toGoSide ? (index == 3 ? 22 : 0) : position[2]], index , oldCardPosition);
            }
        }
        }
        this.gameService.whichPropertyAmI(this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)]);
      }
    }
  }
  async movePlayerGsap(position:any ,index:number, oldCardPosition:number){
    //Based on given axis, move the player animating it using gsap library
    if(this.gameTableSides[index] == 'x'){
      //Calculate player position before moving and the amount of cells to pass through
      let playerPos = parseFloat(JSON.parse(JSON.stringify(this.playerRef._objRef.position.x)).toFixed(1))
      let counterOfCards = Math.round(position[0]) != 22 ? (parseFloat(position[0].toFixed(1)) / 2.2) - (playerPos / 2.2) : (22 / 2.2) - (playerPos / 2.2);
      let xIndex = 0;
      for ((counterOfCards > 0 ? xIndex = 1 : xIndex = -1); (counterOfCards > 0 ? xIndex <= Math.round(counterOfCards) : xIndex >= Math.round(counterOfCards)) ;(counterOfCards > 0 ? xIndex++ : xIndex--)) {
        this.gameService.setCameraPosition(this.gameService.camera, playerPos +  parseFloat(( xIndex * 2.2).toFixed(1)), position[1], position[2],800,5, true, 'x');
        let shouldJump : boolean = false;
        let anotherPlayerOffset:number = this.movePlayerFromBeingOverAnother('x', playerPos , xIndex);
        await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + anotherPlayerOffset, duration: 0.8, ease: 'ease-out' ,  onUpdate: (currentValue) => {
          //Check if player has reached the start cell and call the function.
          if ((this.playerRef._objRef.position.x == 0 && this.playerRef._objRef.position.z == 0) && oldCardPosition!=0 && !this.gameService.players[this.gameService.turn].addingMoney && !this.gameService.players[this.gameService.turn].removingMoney) {
            this.gameService.playerPassedStart()
          }
          //Check if player has reached one angle of the gameTable, if so rotate the player.
          if(this.playerRef._objRef.position.x == 22 || this.playerRef._objRef.position.x == 0){
            this.setPlayerRotation()
          }
          //Check if the player is in a range in which should jump, if so do it otherwise fall down.
          if((counterOfCards > 0 && this.playerRef._objRef.position.x >= (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) - 2) && this.playerRef._objRef.position.x <= (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) - 1.1) && !shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.x > (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + 1.1) && this.playerRef._objRef.position.x < (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + 2) && !shouldJump)){
            shouldJump = true;
            this.playerJump(true);
          }else if((counterOfCards > 0 && this.playerRef._objRef.position.x > (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) - 1.1) && this.playerRef._objRef.position.x < (playerPos + parseFloat(( xIndex * 2.2).toFixed(1))) && shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.x > (playerPos + parseFloat(( xIndex * 2.2).toFixed(1))) && this.playerRef._objRef.position.x < (playerPos + parseFloat(( xIndex * 2.2).toFixed(1)) + 1.1) && shouldJump)){
            shouldJump = false;
            this.playerJump(false);
          }
        }},);
      }
    }
    if(this.gameTableSides[index] == 'z'){
      let playerPos = parseFloat(JSON.parse(JSON.stringify(this.playerRef._objRef.position.z)).toFixed(1))
      let counterOfCards = Math.round(position[2]) != 22 ? (parseFloat(position[2].toFixed(1)) / 2.2) - (playerPos / 2.2) : (22 / 2.2) - (playerPos / 2.2);
      let zIndex = 0;
      for ((counterOfCards > 0 ? zIndex = 1 : zIndex = -1); (counterOfCards > 0 ? zIndex <= Math.round(counterOfCards) : zIndex >= Math.round(counterOfCards)) ;(counterOfCards > 0 ? zIndex++ : zIndex--)) {
        this.gameService.setCameraPosition(this.gameService.camera, position[0] , position[1], playerPos +  parseFloat(( zIndex * 2.2).toFixed(1)),800,5, true, 'z');
        let shouldJump : boolean = false;
        let anotherPlayerOffset:number = this.movePlayerFromBeingOverAnother('z', playerPos , zIndex);
        await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + anotherPlayerOffset, duration: 0.8, ease: 'ease-out' ,  onUpdate: (currentValue) => {
          if ((this.playerRef._objRef.position.x == 0 && this.playerRef._objRef.position.z == 0) && oldCardPosition!=0 && !this.gameService.players[this.gameService.turn].addingMoney && !this.gameService.players[this.gameService.turn].removingMoney) {
            this.gameService.playerPassedStart()
          }
          if(this.playerRef._objRef.position.z == 22 || this.playerRef._objRef.position.z == 0){
            this.setPlayerRotation()
          }
          if((counterOfCards > 0 && this.playerRef._objRef.position.z >= (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) - 2) && this.playerRef._objRef.position.z <= (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) - 1.1) && !shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.z > (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + 1.1) && this.playerRef._objRef.position.z < (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + 2) && !shouldJump)){
            shouldJump = true;
            this.playerJump(true);
          }else if((counterOfCards > 0 && this.playerRef._objRef.position.z > (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) - 1.1) && this.playerRef._objRef.position.z < (playerPos + parseFloat(( zIndex * 2.2).toFixed(1))) && shouldJump) || (counterOfCards < 0 && this.playerRef._objRef.position.z > (playerPos + parseFloat(( zIndex * 2.2).toFixed(1))) && this.playerRef._objRef.position.z < (playerPos + parseFloat(( zIndex * 2.2).toFixed(1)) + 1.1) && shouldJump)){
            shouldJump = false;
            this.playerJump(false);
          }
        }},);
      }
    }
  }

   setPlayerRotation(){
    let rotationValue = 0;
    if(this.player.actualCard  >= 0 && this.player.actualCard  < 10){
      rotationValue = 0;
    }else if(this.player.actualCard  >= 10 && this.player.actualCard  < 20){
      rotationValue = -Math.PI / 2;
    }else if(this.player.actualCard  >= 20 && this.player.actualCard  < 30){
      rotationValue = -Math.PI;
    }else if(this.player.actualCard  >= 30 && this.player.actualCard  <= 39){
      rotationValue = Math.PI / 2;
    }
    gsap.fromTo(this.playerRef._objRef.rotation, {y: this.playerRef._objRef.rotation.y}, {y: rotationValue, duration: 1});
    this.player.pawn.rotation = [0, rotationValue ,0];
  }

  async cycleMap(actualSide:number, oldCardPosition:number, indexCheckNum:number, indexMinusNum:number ,  finalPosition:Array<number>){
    for (let index = actualSide; index <= (indexMinusNum); index++) {
      if(index < indexCheckNum){
        await this.movePlayerGsap([(index == 0 ? 22 : 0), 0 , (index == 1 ? 22 : 0)], index,oldCardPosition);
      }else{
        await this.movePlayerGsap(finalPosition, index,oldCardPosition);
      }
    }
  }

  playerJump(shouldJump:boolean){
    gsap.fromTo(this.playerRef._objRef.position, {y: this.playerRef._objRef.position.y}, {y: shouldJump ? 1 : 0 , ease: 'ease-out'})
  }

  movePlayerFromBeingOverAnother(axis:string , playerPos:number ,index:number){
    //Based on player position on given axis, move the player by the opposite axis by +-0.5 and return += 0.5 to make the player move on the same axis by that amount;
    if(this.gameService.players.filter(player => (axis === 'x' ? player.pawn.position[0] : player.pawn.position[2] ) === playerPos +  parseFloat(( index * 2.2).toFixed(1)) && player.id != this.player.id).length){
      //If there is one or more player on the cell on which the player should pass, then calculate and make the moving player move.
      switch (this.gameService.players.filter(player => player.actualCard ===  this.player.actualCard).length) {
        case 1:// if axis == x --> +x +z  else  -x +z
          this.movePlayerGsapNormal(axis === 'x' ? 'z' : 'x', (axis === 'x' ? this.playerRef._objRef.position.z : this.playerRef._objRef.position.x) + (0.5));
          return axis === 'x' ? 0.5 : -0.5;
        case 2://if axis == x --> +x -z  else  +x +z
          this.movePlayerGsapNormal(axis === 'x' ? 'z' : 'x', (axis === 'x' ? this.playerRef._objRef.position.z : this.playerRef._objRef.position.x) + (axis === 'x' ? -0.5 : 0.5));
          return 0.5; 
        case 3: //if axis == x --> -x -z  else  +x -z
          this.movePlayerGsapNormal(axis === 'x' ? 'z' : 'x', (axis === 'x' ? this.playerRef._objRef.position.z : this.playerRef._objRef.position.x) + (-0.5));
          return axis === 'x' ? 0.5 : -0.5;
        case 4: //if axis == x --> -x +z  else  -x -z
          this.movePlayerGsapNormal(axis === 'x' ? 'z' : 'x', (axis === 'x' ? this.playerRef._objRef.position.z : this.playerRef._objRef.position.x) + (axis === 'x' ? 0.5 : -0.5));
          return -0.5; 
        default:
          return 0;
      }
    }else{
      //If the is no player on the cell on which the player should pass, then check if the moving player is already moved, if so then move it back in normal position 
      if(this.playerRef._objRef.position.x == playerPos - 0.5){
        this.movePlayerGsapNormal('x', this.playerRef._objRef.position.x + 0.5);
      }else if(this.playerRef._objRef.position.x == playerPos + 0.5){
        this.movePlayerGsapNormal('x', this.playerRef._objRef.position.x - 0.5);
      }if(this.playerRef._objRef.position.z == playerPos - 0.5){
        this.movePlayerGsapNormal('z', this.playerRef._objRef.position.z + 0.5);
      }if( this.playerRef._objRef.position.z == playerPos + 0.5){
        this.movePlayerGsapNormal('z', this.playerRef._objRef.position.z - 0.5);
      }
      return 0;
    }
  }

  movePlayerGsapNormal(axis:string, value:number){
    if(axis === 'x'){
      gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: value , ease: 'ease-out'})
    }else if(axis === 'z'){
      gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: value , ease: 'ease-out'})
    }
  }
}
