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

  castedShadow:boolean=false;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    //this.playerPosition = new THREE.Vector3(this.player.pawn.position[0], this.player.pawn.position[1], this.player.pawn.position[2]);
    this.setPlayerPosition(this.player.pawn.position, true);
    this.setPlayerPosition$ = this.gameService.setPlayerPosition$.subscribe((data:any) =>{
      if(this.player.id == this.gameService.players[this.gameService.turn].id){
        this.setPlayerPosition(data)
      }
    })
    //this.enableShadow(this.playerRef.objRef, this);
  }
  ngAfterViewInit(){
  }

  ngOnDestroy(){
    this.setPlayerPosition$?.unsubscribe();
  }

  setPlayerPosition(position:any, noAnimation?:boolean){
    if(noAnimation){
      this.playerRef._objRef.position.x = position[0];
      this.playerRef._objRef.position.z = position[2];
    }else{
      this.gameService.setCameraPosition(this.gameService.camera, position[0], position[1], position[2],1250,5, true, this.playerRef)
      if((this.playerRef._objRef.position.x != 0 || this.playerRef._objRef.position.x != 10 || this.playerRef._objRef.position.x != 20 || this.playerRef._objRef.position.x != 30) && (position[0] == 0 || position[0] == 10  || position[0] == 20 || position[0] == 30)){
        gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: position[0], duration: 1250/1000});
        setTimeout(() => {
          gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: position[2], duration: 1250/1000});
        }, 1250);
      }else{
        gsap.fromTo(this.playerRef._objRef.position, {z: this.playerRef._objRef.position.z}, {z: position[2], duration: 1250/1000});
        setTimeout(() => {
          gsap.fromTo(this.playerRef._objRef.position, {x: this.playerRef._objRef.position.x}, {x: position[0], duration: 1250/1000});
        }, 1250);
      }
    }
   
  }

  enableShadow(element:any, that:any){
    const material = new THREE.MeshStandardMaterial();
    element.traverse((child:any) => {
      if (child.isMesh) {
          child.castShadow=true;
          child.receiveShadow=true;
          //child.material = material;
      }
    })
    return element;
  }

}
