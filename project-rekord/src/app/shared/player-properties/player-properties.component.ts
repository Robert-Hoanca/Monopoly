import { Component, Input, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-player-properties',
  templateUrl: './player-properties.component.html',
  styleUrls: ['./player-properties.component.scss']
})
export class PlayerPropertiesComponent implements OnInit {
  
  @Input() playerId: string = '';

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

  getPlayerProps(){
    return  this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == this.playerId));
  }

}
