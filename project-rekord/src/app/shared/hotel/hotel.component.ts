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
  hotelUrl:string='';
  hotelPosition:[x: number, y: number, z: number] | any = [];
  constructor() { }

  ngOnInit(): void {
    this.hotelUrl = '../../../assets/blenderModels/card/hotel/hotel.gltf';
    this.calculateHousePosition();
  }

  calculateHousePosition(){
    this.hotelPosition = this.cardPosition;
  }

}
