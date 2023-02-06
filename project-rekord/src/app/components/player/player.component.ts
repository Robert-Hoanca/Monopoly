import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { Vector3 } from 'three';
import gsap from 'gsap'

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
        this.setPlayerPosition(data.cardPosition, false ,data.oldCardPosition)
      }
    })
  }
  async ngAfterViewInit(){
  }

  ngOnDestroy(){
    this.setPlayerPosition$?.unsubscribe();
  }

  async setPlayerPosition(position:any, noAnimation?:boolean ,oldCardPosition?:number,){
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
        }else if(oldCardPosition >10 && oldCardPosition < 20){
          actualSide = 1;
        }else if(oldCardPosition >= 0 && oldCardPosition <=10){
          actualSide = 0;
        }
        if(actualSide < toGoSide){
          for (let index = actualSide; index < (toGoSide); index++) {
            await this.movePlayerGsap(position, index)
          }
        }else if(actualSide > toGoSide){
          await this.movePlayerGsap(position, actualSide)
        }
        await this.movePlayerGsap(position, this.gameService.players[this.gameService.turn].inPrison ? (actualSide += actualSide > 2 ? -1 : 1) : toGoSide)
      }
    }
  }

  async movePlayerGsap(position:any ,index:number){
    if(this.gameTableSides[index] == 'x'){
      this.gameService.setCameraPosition(this.gameService.camera, position[0], position[1], position[2],1000,5, true, this.playerRef, 'x')
      if(position[0] != 22){
        await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: position[0], duration: 1000/1000});
      }else{
        await gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: 22, duration: 1000/1000});
      }
    }
    if(this.gameTableSides[index] == 'z'){
      this.gameService.setCameraPosition(this.gameService.camera, position[0], position[1], position[2],1000,5, true, this.playerRef, 'z')
      if(position[2] != 22){
        await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: position[2], duration: 1000/1000});
      }else{
        await gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: 22, duration: 1000/1000});
      }
    }
  }

}
