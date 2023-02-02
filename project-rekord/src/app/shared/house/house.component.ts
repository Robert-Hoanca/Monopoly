import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-house',
  templateUrl: './house.component.html',
  styleUrls: ['./house.component.scss']
})
export class HouseComponent implements OnInit {
  @Input() card!: any;
  @Input() cardPosition!: any;
  @Input() cardRotation!: any;
  @Input() cardIndex!: any;
  @Input() houseIndex!: any;
  @Input() possiblePositions!: any;
  houseUrl:string='';
  housePosition:[x: number, y: number, z: number] | any = [];
  houseRotation: [x: number, y: number, z: number] | any = [];
  randomPositionValue : number | undefined = undefined;
  @ViewChild('houseRef', { static: true }) houseRef:any;

  constructor() { }

  ngOnInit(): void {
    this.houseUrl = '../../../assets/blenderModels/card/house/house.gltf';
    this.calculateHousePosition();
  }
  ngAfterViewInit(){
  }

  calculateHousePosition(){
    
    // if(this.cardIndex<= 10 || 20 < this.cardIndex && this.cardIndex <= 30){
    //   switch(this.houseIndex){
    //     case 1:
    //       this.housePosition[0]+=0.5;
    //       break;
    //     case 2:
    //       this.housePosition[0]+=0.15;
    //       break;
    //     case 3:
    //       this.housePosition[0]-=0.15;
    //       break;
    //     case 4:
    //       this.housePosition[0]-=0.5;
    //       break;
    //   }
    // }else if(10 < this.cardIndex && this.cardIndex <= 20 || 30 < this.cardIndex && this.cardIndex <= 40){
    //   switch(this.houseIndex){
    //     case 1:
    //       this.housePosition[2]+=0.5;
    //       break;
    //     case 2:
    //       this.housePosition[2]+=0.15;
    //       break;
    //     case 3:
    //       this.housePosition[2]-=0.15;
    //       break;
    //     case 4:
    //       this.housePosition[2]-=0.5;
    //       break;
    //   }
    // }
    // this.housePosition[1]+=0.1;


    // if(this.cardIndex<= 10){
    //   this.housePosition[2]+=0.8;
    // }else if(20 < this.cardIndex && this.cardIndex <= 30){
    //   this.housePosition[2]-=0.8;
    // }else if(10 < this.cardIndex && this.cardIndex <= 20){
    //   this.housePosition[0]-=0.8;
    // } else if(30 < this.cardIndex && this.cardIndex <= 40){
    //   this.housePosition[0]+=0.8;
    // }
    if(this.randomPositionValue == undefined){
      this.housePosition = JSON.parse(JSON.stringify(this.cardPosition));
      let randomPositionIndex = Math.round(Math.random() * ((this.possiblePositions.length - 1) - 0) + 0);
      this.randomPositionValue = this.possiblePositions[randomPositionIndex];
      switch(this.randomPositionValue){
        case 1:
          this.housePosition[0] -= ((Math.floor(Math.random() * 7) + 2) / 10);
          this.housePosition[2] -= ((Math.floor(Math.random() * 7) + 2) / 10);
          break;
        case 2:
          this.housePosition[0] -= ((Math.floor(Math.random() * 7) + 2) / 10);
          this.housePosition[2] += ((Math.floor(Math.random() * 7) + 2) / 10);
          break;
        case 3:
          this.housePosition[0] += ((Math.floor(Math.random() * 7) + 2) / 10);
          this.housePosition[2] -= ((Math.floor(Math.random() * 7) + 2) / 10);
          break;
        case 4:
          this.housePosition[0] += ((Math.floor(Math.random() * 7) + 2) / 10);
          this.housePosition[2] += ((Math.floor(Math.random() * 7) + 2) / 10);
          break;
      }
      this.houseRotation = [0,(Math.PI / 2)* Math.round(Math.random() * (100 - 1) + 1),0];
      this.possiblePositions.splice(randomPositionIndex,1);
    }
  }

  ngOnDestroy(){
    this.possiblePositions.push(this.randomPositionValue);
  }

  getRandomTreeNum(){
    return Math.floor(Math.random() * 4) + 1;
  }
}
