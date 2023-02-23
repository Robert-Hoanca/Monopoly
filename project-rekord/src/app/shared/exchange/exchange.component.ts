import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.scss'],
  animations: [
    trigger(
      'mmAnimationGrowHeight',
      [
        transition(
          ':enter', [
          style({ height: '0', opacity: 0 }),
          animate('300ms ease-in', style({ height: '*', 'opacity': 1 }))
        ]
        ),
        transition(
          ':leave', [
          style({ height: '*', 'opacity': 1 }),
          animate('300ms ease-out', style({ height: '0', 'opacity': 0 }))
        ])
      ]
    ),
  ]
})
export class ExchangeComponent implements OnInit {
  playerToExchangeWith:any= '';
  playerToExchangeProps:Array<any> = [];
  actualPlayerProps:Array<any> = [];
  moneyToExchange:Array<any> = [[0],[0],];
  startExchange:boolean=false;
  actualExpanded:string = '';

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
    return this.gameService.players.filter(player => player.id !== this.gameService.players[this.gameService.turn].id)
  }

  selectPlayerToExchange(player:any){
    this.playerToExchangeWith = player;
    this.actualPlayerProps = this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == this.gameService.players[this.gameService.turn].id));
    this.playerToExchangeProps = this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: { owner: any; }) => prop.owner == player.id));
    this.actualExpanded = this.gameService.players[this.gameService.turn].id;
  }

  finaliseExchange(answer:string){

    if(answer=='accept'){
      if(this.playerToExchangeProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).length){
        this.playerToExchangeProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).forEach((property: {completedSeries: any; name: any;}) => {
          const card = this.gameService.gameTable.cards.find((card: { name: any; })=>card.name == property.name);
          card.owner = this.gameService.players[this.gameService.turn].id;
          card.exchangeSelected = false
          if(!property.completedSeries){
            this.gameService.checkCompletedSeries(property, this.gameService.players[this.gameService.turn].id);
          }
        });
      }
      if(this.actualPlayerProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).length){
        this.actualPlayerProps.filter((property: { exchangeSelected: any; }) => property.exchangeSelected).forEach((property: {completedSeries: any; name: any; }) => {
          const card = this.gameService.gameTable.cards.find((card: { name: any; })=>card.name == property.name);
          card.owner = this.playerToExchangeWith.id;
          card.exchangeSelected = false
          if(!property.completedSeries){
            this.gameService.checkCompletedSeries(property, this.playerToExchangeWith.id)
          }
        });
      }
      if(this.moneyToExchange[0]>0){
          //this.gameService.players[this.gameService.turn].money -= this.moneyToExchange[0];
          //this.playerToExchangeWith.money += this.moneyToExchange[0];
          this.gameService.addingRemovingMoney('remove', this.moneyToExchange[0], 1000);
          this.gameService.addingRemovingMoney('add', this.moneyToExchange[0], 1000, this.playerToExchangeWith);


          //IMPEDIRE DI AVVIARE LO SCAMBIO SE SI CHIEDE TROPPI SOLDI DI QUELLO CHE SI HA E DI QUELLO CHE L'ALTRO GIOCATORE HA
          //this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn],this.moneyToExchange[0]);
      }
      if(this.moneyToExchange[1]>0){
        //this.gameService.players[this.gameService.turn].money += this.moneyToExchange[1];
        //this.playerToExchangeWith.money -= this.moneyToExchange[1];
        
        this.gameService.addingRemovingMoney('add', this.moneyToExchange[1], 1000);
        this.gameService.addingRemovingMoney('remove', this.moneyToExchange[1], 1000, this.playerToExchangeWith);

        //IMPEDIRE DI AVVIARE LO SCAMBIO SE SI CHIEDE TROPPI SOLDI DI QUELLO CHE SI HA E DI QUELLO CHE L'ALTRO GIOCATORE HA
        //this.gameService.checkBankrupt(this.playerToExchangeWith,this.moneyToExchange[1]);
      }
    }
    this.goBackToSelection();
    this.close();
  }

  changeActualExpanded(playerId:string){
    this.actualExpanded = this.actualExpanded == playerId ? '' : playerId;
  }
}
