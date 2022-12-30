import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { Vector3 } from 'three';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() player:any;
  @ViewChild('playerRef', { static: true }) playerRef:any;
  playerPosition: Vector3 | any;

  castedShadow:boolean=false;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.playerPosition = new THREE.Vector3();
    this.playerPosition.x = this.player.pawn.position[0];
    this.playerPosition.y = this.player.pawn.position[1];
    this.playerPosition.z = this.player.pawn.position[2];
    console.log(this.playerPosition)
  }


  enableShadow(element:any, that:any){
    const material = new THREE.MeshStandardMaterial();
    element.traverse((child:any) => {
      if (child.isMesh && !that.castedShadow) {
          child.castShadow=true;
          child.receiveShadow=true;
          //child.material = material;
          that.castedShadow = true;
      }
    })
    return element;
  }

}
