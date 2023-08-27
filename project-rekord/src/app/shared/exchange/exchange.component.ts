import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogActionTypes, DialogTypes, MessageTypes } from 'src/app/enums/onlineMessageType';
import { SoundTypes } from 'src/app/enums/soundTypes';
import { cardModel } from 'src/app/models/card';
import { playerModel } from 'src/app/models/player';
import { GameService } from 'src/app/services/game.service';
import { SoundService } from 'src/app/services/sound.service';

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
  playerToExchangeProps:Array<cardModel> = [];
  actualPlayerProps:Array<cardModel> = [];
  moneyToExchange:Array<any> = [[0],[0],];
  startExchange:boolean=false;
  actualExpanded:string = '';
  subscriptions$: Array<Subscription> = [];

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<ExchangeComponent>, public gameService: GameService, public soundService : SoundService) { }

  ngOnInit(): void {
    this.resetSelectedProps();
    this.soundService.playSound(SoundTypes.OPEN_DIALOG)
    this.subscriptions$.push( this.gameService.exchangeDialogAction$.subscribe( (data:any) => {
      this.executeOnlineAction(data.actionType, data)
    }))
  }
  ngAfterViewInit(){
  }

  close(): void {
    this.dialogRef.close();
  }

  goBackToSelection(){
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'exchange' , actionType : DialogActionTypes.BACK_TO_SELECTION}}});
    this.playerToExchangeWith = '';
    this.moneyToExchange[0]= 0;
    this.moneyToExchange[1]= 0;
    this.startExchange = false;
  }

  getPlayersToExchangeWith(){
    return this.gameService.players.filter((player:playerModel) => player.id !== this.gameService.players[this.gameService.turn].id)
  }

  selectPlayerToExchange(player:any){
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'exchange' , actionType : DialogActionTypes.SELECT_PLAYER, playerId: player.id}}});
    this.playerToExchangeWith = player;
    this.actualPlayerProps = this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: cardModel) => prop.owner == this.gameService.players[this.gameService.turn].id));
    this.playerToExchangeProps = this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: cardModel) => prop.owner == player.id));
    this.actualExpanded = this.gameService.players[this.gameService.turn].id;
  }

  finaliseExchange(answer:string){
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'exchange' , actionType : DialogActionTypes.FINALISE_EXCHANGE, answer: answer}}});
    if(answer=='accept'){
      const allPropsFound:Array<any> = [];
      if(this.playerToExchangeProps.filter((property: cardModel) => property.exchangeSelected).length){
        const props = this.playerToExchangeProps.filter((property: cardModel) => property.exchangeSelected)
        props.forEach((property: cardModel) => {
          const card = this.gameService.gameTable.cards.find((card: cardModel)=>card.name == property.name);
          if(card){
            card.owner = this.gameService.players[this.gameService.turn].id;
            card.exchangeSelected = false;
            card.completedSeries = false;
          }
          allPropsFound.push(property);
        });
      }
      if(this.actualPlayerProps.filter((property: cardModel) => property.exchangeSelected).length){
        const props = this.actualPlayerProps.filter((property: cardModel) => property.exchangeSelected)
        props.forEach((property: cardModel) => {
          const card = this.gameService.gameTable.cards.find((card: cardModel)=>card.name == property.name);
          if(card){
            card.owner = this.playerToExchangeWith.id;
            card.exchangeSelected = false;
            card.completedSeries = false;
          }
          allPropsFound.push(property);
        });
      }
      this.gameService.checkCompletedSeries(allPropsFound);
      if(this.moneyToExchange[0]>0){
          this.gameService.addingRemovingMoney('remove', this.moneyToExchange[0], 1000);
          this.gameService.addingRemovingMoney('add', this.moneyToExchange[0], 1000, this.playerToExchangeWith);
      }
      if(this.moneyToExchange[1]>0){
        this.gameService.addingRemovingMoney('add', this.moneyToExchange[1], 1000);
        this.gameService.addingRemovingMoney('remove', this.moneyToExchange[1], 1000, this.playerToExchangeWith);
      }
    }
    this.close();
  }

  changeActualExpanded(playerId:string){
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'exchange' , actionType : DialogActionTypes.CHANGE_EXPANDED, playerId: playerId}}});
    this.actualExpanded = this.actualExpanded == playerId ? '' : playerId;
  }

  resetSelectedProps(){
    this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: cardModel) => prop.owner == this.playerToExchangeWith.id)).forEach(property => {
      if(property.exchangeSelected){
        property.exchangeSelected = false;
      }
    });;
    this.gameService.sortProperties(this.gameService.gameTable.cards.filter((prop: cardModel) => prop.owner == this.gameService.players[this.gameService.turn].id)).forEach(property => {
      if(property.exchangeSelected){
        property.exchangeSelected = false;
      }
    });;
  }
  checkIfCanExchange(){
    if(
      ( this.moneyToExchange[0] > 0 || this.playerToExchangeProps.filter((property: cardModel) => property.exchangeSelected).length) 
        ||
      ( this.moneyToExchange[1] > 0 || this.actualPlayerProps.filter((property: cardModel) => property.exchangeSelected).length) 
        && 
      (this.moneyToExchange[0] <= this.playerToExchangeWith.money && this.moneyToExchange[1] <= this.gameService.players[this.gameService.turn].money)
    ){
      return false;
    }else{
      return true;
    }
  }
  startToExchange(){
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'exchange' , actionType : DialogActionTypes.START_EXCHANGE}}});
    this.startExchange = true;
  }

  executeOnlineAction(type:string, data?:any){
    switch (type) {
      case DialogActionTypes.CLOSE:
        this.close();
        break;
      case DialogActionTypes.SELECT_PLAYER:
        this.selectPlayerToExchange(this.gameService.players.find((player:playerModel) => player.id === data.playerId))
        break;
      case DialogActionTypes.CHANGE_EXPANDED:
        this.changeActualExpanded(data.playerId);
        break
      case DialogActionTypes.START_EXCHANGE:
        this.startToExchange()
        break
      case DialogActionTypes.BACK_TO_SELECTION:
        this.goBackToSelection();
        break
      case DialogActionTypes.FINALISE_EXCHANGE:
        this.finaliseExchange(data.answer);
        break
      default:
        break;
    }
  }

  ngOnDestroy(){
    this.resetSelectedProps();
    this.soundService.playSound(SoundTypes.OPEN_DIALOG);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : DialogTypes.EXCHANGE, actionType : DialogActionTypes.CLOSE }}});
    this.subscriptions$.forEach(sub => {
      sub.unsubscribe();
    });
  }
}
