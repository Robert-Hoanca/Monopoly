import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-grass-item',
  templateUrl: './grass-item.component.html',
  styleUrls: ['./grass-item.component.scss']
})
export class GrassItemComponent implements OnInit {

  randomStartingPointX: number = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
  randomStartingPointZ: number =  ((Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 - 0 + 1)) + 5));

  constructor(public gameService:GameService) { }

  ngOnInit(): void {
    this.chooseStartingPoint()
  }

  chooseStartingPoint(){
    while((this.randomStartingPointX >= 19 && this.randomStartingPointX <= 25) || (this.randomStartingPointZ >= 19 && this.randomStartingPointZ <= 25) ){
      this.randomStartingPointX = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
      this.randomStartingPointZ = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
    }
  }

}
