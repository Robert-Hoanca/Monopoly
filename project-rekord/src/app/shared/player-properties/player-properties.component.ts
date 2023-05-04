import { Component, Input, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-player-properties',
  templateUrl: './player-properties.component.html',
  styleUrls: ['./player-properties.component.scss']
})
export class PlayerPropertiesComponent implements OnInit {
  
  @Input() playerId: string = '';
  @Input() imInExchange: boolean = false;


  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

  getPlayerProps(){
    return  this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == this.playerId));
  }

  getPlayerGetOutCards(){
    return  this.gameService.players.find(player => player.id === this.playerId).prison.getOutCards;
  }

  selectProperty(property:any){
    if(this.imInExchange){
      property.exchangeSelected = !property.exchangeSelected;
    }else if(this.gameService.playerWhoWonId == ''){
      this.gameService.openCardDialog(property)
    }
  }
}
