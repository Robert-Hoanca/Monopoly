import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss']
})
export class ExchangeComponent implements OnInit {
  playerToExchangeWith:any= '';
  playerToExchangeProps:Array<any> = [];
  actualPlayerProps:Array<any> = [];
  moneyToExchange:Array<any> = [[0],[0],];
  startExchange:boolean=false;

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<ExchangeComponent>, public gameService: GameService) { }

  ngOnInit(): void {
   
  }
  ngAfterViewInit(){
  }

  close(): void {
    this.dialogRef.close();
  }

  goBackToSelection(){
    this.playerToExchangeWith = '';
    this.moneyToExchange[0]= 0;
    this.moneyToExchange[1]= 0;
    this.startExchange = false;
  }

  getPlayersToExchangeWith(){
    return this.gameService.players.filter(player => player.id !== this.gameService.actualTurnPlayer.id)
  }

  selectPlayerToExchange(player:any){
    this.playerToExchangeWith = player;
    this.actualPlayerProps = this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == this.gameService.actualTurnPlayer.id)
    this.playerToExchangeProps = this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == player.id)
  }

  finaliseExchange(answer:string){

    if(answer=='accept'){
      if(this.playerToExchangeProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).length){
        this.playerToExchangeProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).forEach((property: {completedSeries: any; name: any;}) => {
          const card = this.gameService.gameTable.cards.find((card: { name: any; })=>card.name == property.name);
          card.owner = this.gameService.actualTurnPlayer.id;
          card.exchangeSelected = false
          if(!property.completedSeries){
            this.gameService.checkCompletedSeries(property);
          }
        });
      }
      if(this.actualPlayerProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).length){
        this.actualPlayerProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).forEach((property: {completedSeries: any; name: any; }) => {
          const card = this.gameService.gameTable.cards.find((card: { name: any; })=>card.name == property.name);
          card.owner = this.playerToExchangeWith.id;
          card.exchangeSelected = false
          if(!property.completedSeries){
            this.gameService.checkCompletedSeries(property)
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
    }
    this.goBackToSelection();
    this.close();
  }
}
