import { Component, Input, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-player-properties',
  templateUrl: './player-properties.component.html',
  styleUrls: ['./player-properties.component.scss']
})
export class PlayerPropertiesComponent implements OnInit {
  
  @Input() playerId: string = '';
  @Input() imInExchange: boolean = false;

  playerProps:Array<any> = [];
  dividedPlayerProps:Array<any> = [];
  playerGetOutCards:number = 0;

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
    this.getPlayerProps()
  }

  getPlayerProps(){
    this.playerProps = this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == this.playerId))
   
    const districts:Array<any> = [];

    this.playerProps.forEach(prop => {
      if(!districts.includes(prop.district)){
        districts.push(prop.district)
      }
    });

    districts.forEach(district => {
      this.dividedPlayerProps.push(this.playerProps.filter(card => card.district === district))
    });
    this.getPlayerGetOutCards();
  }

  getPlayerGetOutCards(){
    this.playerGetOutCards = this.gameService.players.find(player => player.id === this.playerId)?.prison.getOutCards;
  }

  selectProperty(property:any){
    if(this.imInExchange){
      property.exchangeSelected = !property.exchangeSelected;
    }else if(this.gameService.playerWhoWonId == ''){
      this.gameService.openCardDialog(property)
    }
  }
}
