import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DecorationsService } from './decorations.service';
@Component({
  selector: 'app-decoration-item',
  templateUrl: './decoration-item.component.html',
  styleUrls: ['./decoration-item.component.scss']
})
export class DecorationItemComponent implements OnInit {
  
  @Input() whereAmI: string = '';

  randomNum:number = 0;
  randomDecorationNum:Array<any> = [];

  randomCloudsNum: number = Math.round((Math.random() * (30 - 1 + 1)) + 1);
  randomWavesNum: number = Math.round((Math.random() * (30 - 1 + 1)) + 10);
  randomBoatNum: number = Math.round((Math.random() * 4 )+ 1);
  randomGrassNum: number = Math.round((Math.random() * 30 )+ 10);
  randomRainDropsNum: number = Math.round((Math.random() * 30 )+ 10);

  constructor(public decorationsService : DecorationsService) { }

  ngOnInit(): void {
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
