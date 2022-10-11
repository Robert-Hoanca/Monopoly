import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {
  @Input() player:any;
  @ViewChild('playerRef', { static: true }) playerRef:any;

  castedShadow:boolean=false;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }


  enableShadow(element:any, that:any){
    const material = new THREE.MeshStandardMaterial();
    element.traverse((child:any) => {
      if (child.isMesh && !that.castedShadow) {
          child.castShadow=true;
          child.receiveShadow=true;
          child.material = material;
          that.castedShadow = true;
      }
    })
    return element;
  }

}
