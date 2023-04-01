import { Component, Input, OnInit } from '@angular/core';

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
  houseUrl:string='';
  housePosition:[x: number, y: number, z: number] | any = [];

  constructor() { }

  ngOnInit(): void {
    this.houseUrl = '../../../assets/blenderModels/card/house/house3.gltf';
    this.calculateHousePosition();
  }
  ngAfterViewInit(){
  }

  calculateHousePosition(){
    this.housePosition = JSON.parse(JSON.stringify(this.cardPosition));
    if(this.cardIndex<= 10 || 20 < this.cardIndex && this.cardIndex <= 30){
      switch(this.houseIndex){
        case 1:
          this.housePosition[0]+=0.5;
          break;
        case 2:
          this.housePosition[0]+=0.15;
          break;
        case 3:
          this.housePosition[0]-=0.15;
          break;
        case 4:
          this.housePosition[0]-=0.5;
          break;
      }
    }else if(10 < this.cardIndex && this.cardIndex <= 20 || 30 < this.cardIndex && this.cardIndex <= 40){
      switch(this.houseIndex){
        case 1:
          this.housePosition[2]+=0.5;
          break;
        case 2:
          this.housePosition[2]+=0.15;
          break;
        case 3:
          this.housePosition[2]-=0.15;
          break;
        case 4:
          this.housePosition[2]-=0.5;
          break;
      }
    }
    this.housePosition[1]+=0.1;
    if(this.cardIndex<= 10){
      this.housePosition[2]+=0.8;
    }else if(20 < this.cardIndex && this.cardIndex <= 30){
      this.housePosition[2]-=0.8;
    }else if(10 < this.cardIndex && this.cardIndex <= 20){
      this.housePosition[0]-=0.8;
    } else if(30 < this.cardIndex && this.cardIndex <= 40){
      this.housePosition[0]+=0.8;
    }
  }
}
