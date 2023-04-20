import { Component, OnInit, ViewChild } from '@angular/core';
import { ThMesh } from 'ngx-three';
import { DecorationsService } from '../../decoration-item/decorations.service';

@Component({
  selector: 'app-water-wave-item',
  templateUrl: './water-wave-item.component.html',
  styleUrls: ['./water-wave-item.component.scss']
})
export class WaterWaveItemComponent implements OnInit {
  @ViewChild('water_waveRef', { static: true }) water_waveRef: ThMesh | undefined;

  randomWaveSize : number = (Math.random() * (0.5 - 0.2 + 0.5)) + 0.2; //(Math.random() * (max - min + 1)) + min

  randomStartingPointX: number = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
  randomStartingPointZ: number =  ((Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 - 0 + 1)) + 5));
  waterOpacity:number = (Math.random() * (1 - 0.5)) + 0.2;

  randomInterval:number = ((Math.random() * (100 + (0) + 1)) + 1);

  constructor(public decorationsService:DecorationsService) { }

  ngOnInit(): void {
    this.chooseStartingPoint()
    if(this.water_waveRef){
      setInterval(() => {
        this.decorationsService.scaleAnimation(this.water_waveRef);
      }, 1500 + this.randomInterval)
    }
  }


  chooseStartingPoint(){
    while((this.randomStartingPointX >= 19 && this.randomStartingPointX <= 25) || (this.randomStartingPointZ >= 19 && this.randomStartingPointZ <= 25) ){
      this.randomStartingPointX = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
      this.randomStartingPointZ = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
    }
  }
}
