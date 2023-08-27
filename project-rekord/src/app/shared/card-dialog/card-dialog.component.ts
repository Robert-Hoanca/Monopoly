import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogActionTypes, MessageTypes } from 'src/app/enums/onlineMessageType';
import { SoundTypes } from 'src/app/enums/soundTypes';
import { cardModel } from 'src/app/models/card';
import { playerModel } from 'src/app/models/player';
import { GameService } from 'src/app/services/game.service';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-card-dialog',
  templateUrl: './card-dialog.component.html',
  styleUrls: ['./card-dialog.component.scss'],
  animations: [
    trigger(
      'mmAnimationScale',
      [
        transition(
          ':enter', [
          style({ transform: 'scale(0)', opacity: 0 }),
          animate('300ms ease-in', style({ transform: 'scale(1)', 'opacity': 1 }))
        ]
        ),
        transition(
          ':leave', [
          style({ transform: 'scale(1)', 'opacity': 1 }),
          animate('300ms ease-out', style({ transform: 'scale(0)', 'opacity': 0 }))
        ])
      ]
    ),
  ]
})
export class CardDialogComponent implements OnInit {
  houses:Array<string> = [];
  hotel:boolean=false;
  completedSeriesCards:Array<any> = [];
  ownerName:string = '';
  subscriptions$: Array<Subscription> = [];

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<CardDialogComponent>, public gameService: GameService, public soundService : SoundService) { }

  ngOnInit(): void {
    this.soundService.playSound(SoundTypes.OPEN_CARD);
    this.subscriptions$.push(this.gameService.cardDialogAction$.subscribe( (data:any) => {
      this.executeOnlineAction(data.type, data.data)
    }))
  }
  ngAfterViewInit(){
    if(this.data.completedSeries){
      this.data.cards.forEach((series:any, index:number) => {
        setTimeout(() => {
          this.completedSeriesCards = [];
          this.completedSeriesCards = series;
          this.ownerName = this.getPlayerName();
        }, index * 1500);
      });
      setTimeout(() => {
        this.gameService.closeDialog(this.dialogRef)
      }, this.data.cards.length * 1500);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  counterHouses(){
    if(!this.data.card.hotelCounter){
      for (let i = 0; i < this.data.card.housesCounter; i++) {
        this.houses.push('');
      }
    }else if(this.data.card.hotelCounter){
      this.hotel = true;
    }
  }
  
  addHouse(){
    this.data.card.housesCounter++;
    this.gameService.addingRemovingMoney('remove', this.data.card.houseCost, 1000);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'card' , actionType : DialogActionTypes.ADD_HOUSE}}});
  }

  removeHouse(){
    this.data.card.housesCounter--;
    this.gameService.addingRemovingMoney('add', ((this.data.card.houseCost / 100) * 50), 1000);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'card' , actionType : DialogActionTypes.REMOVE_HOUSE}}});
  }

  addHotel(){
    this.data.card.hotelCounter++;
    this.gameService.addingRemovingMoney('remove', this.data.card.hotelCost, 1000);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'card' , actionType : DialogActionTypes.ADD_HOTEL}}});
  }
  removeHotel(){
    this.data.card.hotelCounter--;
    this.gameService.addingRemovingMoney('add', ((this.data.card.hotelCost / 100) * 50), 1000);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'card' , actionType : DialogActionTypes.REMOVE_HOTEL}}});
  }
  getContrastColor(bgColor:string) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 186) ?
    '#000' : '#fff';
  }
  
  getPlayerName(){
    if(this.completedSeriesCards[0]){
      return this.gameService.players.find((player:playerModel) => player.id === this.completedSeriesCards[0].owner)?.name ?? '';
    }else{
      return ''
    }
  }

  executeOnlineAction(type:string, data:any){
    switch (type) {
      case DialogActionTypes.CLOSE:
        this.close();
        break;
      case DialogActionTypes.BUY_PROPERTY:
        this.gameService.buyProperty(this.gameService.gameTable.cards.find((card:cardModel) => card.index === data.cardI));
        this.close();
        break;
      case DialogActionTypes.ADD_HOTEL:
        this.addHotel();
        break;
      case DialogActionTypes.REMOVE_HOTEL:
        this.removeHotel();
        break;
      case DialogActionTypes.ADD_HOUSE:
        this.addHouse();
        break;
      case DialogActionTypes.REMOVE_HOUSE:
        this.removeHouse();
        break;
      case DialogActionTypes.DISTRAIN_PROPERTY:
        this.gameService.distrainProperty(this.data.card);
        this.close();
        break;
      case DialogActionTypes.CANCEL_DISTRAIN:
        this.gameService.cancelDistrainedFromProperty(this.data.card);
        break;
    
      default:
        break;
    }
  }

  ngOnDestroy(){
    this.soundService.playSound(SoundTypes.OPEN_CARD);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : 'card' , actionType : DialogActionTypes.CLOSE}}});
    this.subscriptions$.forEach(sub => {
      sub.unsubscribe()
    });
  }
}
