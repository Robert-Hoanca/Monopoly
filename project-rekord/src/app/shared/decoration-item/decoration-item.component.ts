import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import gsap from 'gsap'
import { ThMesh } from 'ngx-three';
@Component({
  selector: 'app-decoration-item',
  templateUrl: './decoration-item.component.html',
  styleUrls: ['./decoration-item.component.scss']
})
export class DecorationItemComponent implements OnInit {
  
  @Input() decorationType: Array<string> = [];

  randomNum:number = 0;
  randomDecorationNum:Array<any> = [];

  randomCloudsNum: number = Math.round((Math.random() * (30 - 1 + 1)) + 1);
  randomWavesNum: number = Math.round((Math.random() * (30 - 1 + 1)) + 10);
  randomBoatNum: number = Math.round((Math.random() * 4 )+ 1);
  randomGrassNum: number = Math.round((Math.random() * 30 )+ 10);
  randomRainDropsNum: number = Math.round((Math.random() * 30 )+ 10);

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.randomNum = Math.round(Math.random() * (10 - 1) + 1);

    for (let index = 0; index < this.randomNum; index++) {
      this.randomDecorationNum.push({
        index,
        firstRandom : Math.round(Math.random() * (40 - 1) + -10),
        secondRandom : Math.round(Math.random() * (40 - 1) + -10),
        thirdRandom : Math.round(Math.random() * (40 - 1) + -10),
      })
    }
  }

  decorationIsIncluded(type:string){
    return this.decorationType.includes(type);
  }

  recalculateRandomNums(type:string){
    switch (type) {
      case 'cloud':
        this.randomCloudsNum = Math.round((Math.random() * (30 - 1 + 1)) + 10);
        break;
      case 'boat':
        this.randomBoatNum = Math.round((Math.random() * 5 )+ 1);
        break;
      default:
        break;
    }
  }
}
