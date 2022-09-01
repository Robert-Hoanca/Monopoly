import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.component.html',
  styleUrls: ['./choose-mode.component.scss']
})
export class ChooseModeComponent implements OnInit {

  pawnModelCounter:number=0;
  playerName:string='';
  actualPawnDisplayer:string = '';

  url:string='';

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }
  chooseMode(mode:string){
    this.gameService.choosenMode = mode;
  }

  changeModel(way:string,){
    if(way == 'minus'){
      this.pawnModelCounter--;
    }else if(way == 'plus'){
      this.pawnModelCounter++;
    }
  }

  createPlayer(){
    this.playerName = '';
    this.pawnModelCounter = 0;
  }

  filterPawns(){
    return this.gameService.pawnTypes.filter((pawn: { specialPawn: any; }) => !pawn.specialPawn)
  }

}
