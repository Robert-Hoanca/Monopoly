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
  @Input() houseIndex!: any;
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
    //this.housePosition[0]+=0.2;
    //this.housePosition[2]+=0.1;
      switch(this.houseIndex){
        case 1:
          this.housePosition[0]-=0.4;
          break;
        case 2:
          this.housePosition[0]-=0.3;
          break;
        case 3:
          this.housePosition[0]-=0.2;
          break;
        case 4:
          this.housePosition[0]-=1;
          break;
      }
  }

}
