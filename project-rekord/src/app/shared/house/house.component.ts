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
  houseUrl:string='';
  housePosition:[x: number, y: number, z: number] | any = [];

  constructor() { }

  ngOnInit(): void {
    this.houseUrl = '../../../assets/blenderModels/card/house/house.gltf';
    this.calculateHousePosition();
  }
  ngAfterViewInit(){
    
  }

  calculateHousePosition(){
    this.housePosition = this.cardPosition;
    if(this.card.housesCounter){
      switch(this.card.housesCounter){
        case 1:
          this.housePosition[0]+=0.2;
         
          break;
        case 2:
          this.housePosition[0]+=0.4;
          break;
        case 3:
          this.housePosition[0]+=0.6;
          break;
        case 4:
          this.housePosition[0]+=0.8;
          break;
      }
    }
  }

}
