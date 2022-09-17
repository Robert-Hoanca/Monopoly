import { Component, OnInit, ViewChild } from '@angular/core';
import { ThMesh } from 'ngx-three';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @ViewChild('cardInfo', { static: true }) cardInfo:any;
  
  @ViewChild('theGeo', { static: true }) test:any;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

  resizeCanvas(event:any){

  }

}
