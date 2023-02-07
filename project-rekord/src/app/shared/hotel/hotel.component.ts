import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hotel',
  templateUrl: './hotel.component.html',
  styleUrls: ['./hotel.component.scss']
})
export class HotelComponent implements OnInit {
  @Input() card!: any;
  @Input() cardPosition!: any;
  @Input() cardRotation!: any;
  @Input() hotelIndex!: any;
  @Input() cardIndex!: any;
  hotelUrl:string='';
  hotelPosition:[x: number, y: number, z: number] | any = [];
  constructor() { }

  ngOnInit(): void {
    this.hotelUrl = '../../../assets/blenderModels/card/hotel/hotel3.gltf';
    this.calculateHousePosition();
  }

  calculateHousePosition(){
    this.hotelPosition = JSON.parse(JSON.stringify(this.cardPosition));
    if(this.cardIndex<= 10){
      this.hotelPosition[2]+=0.8;
    }else if(20 < this.cardIndex && this.cardIndex <= 30){
      this.hotelPosition[2]-=0.8;
    }else if(10 < this.cardIndex && this.cardIndex <= 20){
      this.hotelPosition[0]-=0.8;
    } else if(30 < this.cardIndex && this.cardIndex <= 40){
      this.hotelPosition[0]+=0.8;
    }
    this.hotelPosition[1]+=0.1;
  }
}
