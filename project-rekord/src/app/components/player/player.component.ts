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
        //console.log("oldCard", oldCardPosition, "actualCard",actualCardPosition,"actualSide", actualSide , "toGoSide", toGoSide)
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
    if(this.gameTableSides[index] == 'x'){
      this.gameService.setCameraPosition(this.gameService.camera, position[0], position[1], position[2],1000,5, true, 'x')
      //console.log("PlayerMoved X" , oldCardPosition , JSON.parse(JSON.stringify(position)))
      if(position[0] != 22){
        await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: position[0], duration: 1,  onUpdate: (currentValue) => {
          // Check if the object has reached the target position
          if ((this.playerRef._objRef.position.x == 0 && this.playerRef._objRef.position.z == 0) && oldCardPosition!=0 && !this.gameService.players[this.gameService.turn].addingMoney && !this.gameService.players[this.gameService.turn].removingMoney) {
            this.gameService.playerPassedStart()
          }
          if(this.playerRef._objRef.position.x == 22 || this.playerRef._objRef.position.x == 0){
            this.setPlayerRotation()
          }
        }}, );
      }else{
        await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: 22, duration: 1, onUpdate:  (currentValue) => {
          if(this.playerRef._objRef.position.x == 22 || this.playerRef._objRef.position.x == 0){
            this.setPlayerRotation()
          }
        }});
      }
    }
    if(this.gameTableSides[index] == 'z'){
      this.gameService.setCameraPosition(this.gameService.camera, position[0], position[1], position[2],1000,5, true, 'z')
      //console.log("PlayerMoved z" , oldCardPosition , JSON.parse(JSON.stringify(position)))
      if(position[2] != 22){
        await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: position[2], duration: 1,  onUpdate: (currentValue) => {
          // Check if the object has reached the target position
          if ((this.playerRef._objRef.position.x == 0 && this.playerRef._objRef.position.z == 0) && oldCardPosition!=0  &&  !this.gameService.players[this.gameService.turn].addingMoney && !this.gameService.players[this.gameService.turn].removingMoney) {
            this.gameService.playerPassedStart()
          }
          if(this.playerRef._objRef.position.z == 22 || this.playerRef._objRef.position.z == 0){
            this.setPlayerRotation()
          }
        }});
      }else{
        await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: 22, duration: 1 , onUpdate:  (currentValue) => {
          if(this.playerRef._objRef.position.z == 22 || this.playerRef._objRef.position.z == 0){
            this.setPlayerRotation();
          }
        }});
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
}
