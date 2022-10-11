import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { WebGLRenderer } from 'three';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('cardInfo', { static: true }) cardInfo:any;

  rendererOptions:object={
    shadowMapType: THREE.VSMShadowMap ,
    antialias: true,
  }

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    
  }
  ngAfterViewInit(){
    //this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //public renderer: WebGLRenderer
  }

  resizeCanvas(event:any){

  }
}
