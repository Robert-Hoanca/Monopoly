import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit {
  playerToExchangeWith:any= '';
  propertyToExchange:Array<any> = [[],[],];
  moneyToExchange:Array<any> = [[0],[0],];

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<ExchangeComponent>, public gameService: GameService) { }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

  goBackToSelection(){
    this.playerToExchangeWith = '';
    this.moneyToExchange[0]= 0;
    this.moneyToExchange[1]= 0;
  }

  getPlayersToExchangeWith(){
    return this.gameService.players.filter(player => player.name !== this.gameService.actualTurnPlayer.name)
  }

  selectPlayerToExchange(player:any){
    this.playerToExchangeWith = player;
  }

  finaliseExchange(){
    if(this.playerToExchangeWith.properties.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).length){
      this.playerToExchangeWith.properties.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).forEach((property: { name: any; }) => {
        const propIndex =  this.playerToExchangeWith.properties.findIndex((propertyI: any) => propertyI.name == property.name);
        if(propIndex>-1){
          this.gameService.actualTurnPlayer.properties.push(this.playerToExchangeWith.properties.splice(propIndex, 1)[0]);
          this.gameService.actualTurnPlayer.properties[this.gameService.actualTurnPlayer.properties.length - 1].exchangeSelected = false;
        }
        
      });
    }
    if(this.gameService.actualTurnPlayer.properties.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).length){
      this.gameService.actualTurnPlayer.properties.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).forEach((property: { name: any; }) => {
        const propIndex =  this.gameService.actualTurnPlayer.properties.findIndex((propertyI: any) => propertyI.name == property.name);
        if(propIndex>-1){
          this.playerToExchangeWith.properties.push(this.gameService.actualTurnPlayer.properties.splice(propIndex, 1)[0]);
          this.playerToExchangeWith.properties[this.playerToExchangeWith.properties.length - 1].exchangeSelected = false;
        }
        
      });
    }

    if(this.moneyToExchange[0]>0){
        this.gameService.actualTurnPlayer.money -= this.moneyToExchange[0];
        this.playerToExchangeWith.money += this.moneyToExchange[0];
    }
    if(this.moneyToExchange[1]>0){
      this.gameService.actualTurnPlayer.money += this.moneyToExchange[1];
      this.playerToExchangeWith.money -= this.moneyToExchange[1];
    }
    this.goBackToSelection();
    this.close();
  }

}
