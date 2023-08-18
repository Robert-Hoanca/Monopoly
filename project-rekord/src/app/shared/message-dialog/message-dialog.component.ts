import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject, take, timer } from 'rxjs';
import { GameService } from 'src/app/services/game.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';
import { SoundService } from 'src/app/services/sound.service';
import { SoundTypes } from 'src/app/enums/soundTypes';
import { EventTypes } from 'src/app/enums/eventTypes';
import { ChestChanceTypes } from 'src/app/enums/chestChanceTypes';
import { DialogActionTypes, DialogTypes, MessageTypes } from 'src/app/enums/onlineMessageType';
import { cardModel } from 'src/app/models/card';
import { playerModel } from 'src/app/models/player';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  getCardPosition$ = new Subject();
  movedNearest:boolean=false;
  subscriptions$: Array<any> = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<CardDialogComponent>, public gameService: GameService, public soundService : SoundService) { }

  ngOnInit(): void {
    if(this.data.eventType === EventTypes.CHANGE_TURN){
      timer(1000).pipe(take(1)).subscribe({
        complete: () => {
          this.closeDialog();
        } 
      })
    }

    if(this.data.eventType === EventTypes.CHANCE || this.data.eventType === EventTypes.COMMUNITY_CHEST){
      this.soundService.playSound(SoundTypes.OPEN_CARD)
    }else{
      this.soundService.playSound(SoundTypes.OPEN_DIALOG)
    }
    this.subscriptions$.push( this.gameService.messageDialogAction$.subscribe( (data:any) => {
      this.executeOnlineAction(data.type)
    }))
  }

  ngAfterViewInit(){
  }

  executeAndClose(){
    switch(this.data.eventType){
      case EventTypes.PAYMONEY :
        const player = (this.data.textData.playerId? this.gameService.players.find((player:playerModel) => player.id === this.data.textData.playerId) : this.gameService.players[this.gameService.turn])
        if(this.data.textData.bankTaxes){
          if(this.gameService.players[this.gameService.turn].money >= this.data.textData.property.taxesCost){
            this.gameService.payTaxes(this.data.textData.property);
          }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], this.data.textData.property.taxesCost)){
            this.gameService.calculateAmountDebt(this.data.textData.property.taxesCost);
          }
        }else if(this.data.textData.playerRent && !this.data.textData.amountDebt){

          if(this.gameService.players[this.gameService.turn].money >= this.gameService.amountRent){
            this.gameService.payRentToPlayer(this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)]);
          }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], this.gameService.amountRent)){
            this.gameService.calculateAmountDebt();
          }
        }else if(this.data.textData.amountDebt && (this.gameService.players[this.gameService.turn].money >= this.data.textData.amountDebt) && this.data.textData.debtWithWho == 'player'){
          this.gameService.payRentToPlayer(this.gameService.gameTable.cards[(this.gameService.players[this.gameService.turn].actualCard)],true);
          this.gameService.debtWithWho = '';
          this.gameService.amountDebt = 0;
        }else if(this.data.textData.amountDebt && player && (player.money >= this.data.textData.amountDebt) && this.data.textData.debtWithWho == 'bank' && !this.gameService.checkBankrupt((this.data.textData.playerId ? this.gameService.players.find((player:playerModel) => player.id === this.data.textData.playerId) : this.gameService.players[this.gameService.turn]),this.data.textData.amountDebt)){
          this.data.textData.playerId? this.gameService.addingRemovingMoney('remove', this.data.textData.amountDebt, 1000 ,this.gameService.players.find((player:playerModel) => player.id == this.data.textData.playerId)) : this.gameService.addingRemovingMoney('remove', this.data.textData.amountDebt, 1000);
          this.gameService.debtWithWho = '';
          this.gameService.amountDebt = 0;
        }
        if(this.gameService.setDebt){this.gameService.setDebt = false}

        break;
      case EventTypes.CHANCE :
        this.calculateChestChance(this.data.textData);
        break;
      case EventTypes.COMMUNITY_CHEST :
        this.calculateChestChance(this.data.textData);
        break;
      case EventTypes.GO_TO_PRISON :
        this.gameService.goToPrison();
        break;
      case EventTypes.EXIT_FROM_PRISON :

      if(!this.data.textData.shouldPay && !this.data.textData.exitFromDice){
        this.gameService.players[this.gameService.turn].prison.getOutCards--;
      }

        if(this.data.textData.shouldPay){
          this.gameService.addingRemovingMoney('remove', 50, 1000)
          this.data.textData.amountDebt
        }
        if(this.data.textData.dice1){
          this.gameService.players[this.gameService.turn].canDice = false;
          this.gameService.getCardPosition(this.gameService.players[this.gameService.turn].actualCard + (this.data.textData.dice1+this.data.textData.dice2));
        }
        break;
      case EventTypes.BANKRUPT : //TO DO SISTEMARE LABEL
        const bankRuptPlayer = this.gameService.players.find((player:playerModel) => player.id == this.data.textData.player.id);
        if(bankRuptPlayer){
          bankRuptPlayer.bankrupt = true;
          bankRuptPlayer.money = 0;
          this.gameService.gameTable.cards.filter((card: cardModel) => card.owner == this.data.textData.player.id).forEach((prop:cardModel) => {
            prop.owner = this.data.textData.playerToPay;
            this.gameService.checkCompletedSeries([prop])
          });
          this.gameService.checkIfSomeoneWon();
        }
        break;
      case EventTypes.WANT_TO_BANKRUPT :
        this.gameService.goBankRupt();
        break;
    }
    this.closeDialog();
    
  }

  calculateChestChance(data:any){
    switch(data.action){
      case ChestChanceTypes.MOVE :
        if(data.cardIndex != undefined && data.cardIndex != null){
          this.gameService.getCardPosition(data.cardIndex)
        }else if(data.count != undefined && data.count != null){
          let cardIndex = 0;
          if(this.gameService.players[this.gameService.turn].actualCard + data.count < 0){
            cardIndex = 40 + (this.gameService.players[this.gameService.turn].actualCard + data.count)
          }else{
            cardIndex = (this.gameService.players[this.gameService.turn].actualCard + (data.count));
          }
          this.gameService.getCardPosition(cardIndex);
        }
        break;
      case ChestChanceTypes.MOVE_NEAREST : //Maybe add multiply option in future
        this.gameService.gameTable.cards.forEach((nearProp: { cardType: any; }, index: number) => {
          if((nearProp.cardType == data.groupid && index > this.gameService.players[this.gameService.turn].actualCard && !this.movedNearest) || (nearProp.cardType == data.groupid && this.gameService.players[this.gameService.turn].actualCard >= 30 && !this.movedNearest)){
            this.gameService.getCardPosition(index);
            this.movedNearest = true;
          }
        });
        break;
      case ChestChanceTypes.ADD_FUNDS :
        this.gameService.addingRemovingMoney('add', data.amount, 1000)
        break;
      case ChestChanceTypes.JAIL :
        if(data.subaction == 'getout'){
          this.gameService.players[this.gameService.turn].prison.getOutCards ++;
        }else if(data.subaction == 'goto'){
          this.closeDialog();
          this.gameService.textDialog({text: this.gameService.players[this.gameService.turn].name + ' have to go to prison.'}, EventTypes.GO_TO_PRISON);
        }
        break;
      case ChestChanceTypes.PROPERTY_CHARGES :
        let amount = 0;
        let housesC = 0;
        let hotelC = 0;
        (this.gameService.gameTable.cards.filter((card: cardModel) => card.owner == this.gameService.players[this.gameService.turn].id)).forEach((card: cardModel) => {
          if(card.hotelCounter){
            hotelC ++;
          }else if(card.housesCounter){
            housesC += card.housesCounter;
          }
        });

        if(housesC){
          amount += (data.houses*housesC);
        }
        if(hotelC){
          amount += (data.hotels*hotelC);
        }

        if(this.gameService.players[this.gameService.turn].money >= amount){
          this.gameService.addingRemovingMoney('remove', amount, 1000)
        }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], amount)){
          this.gameService.calculateAmountDebt(amount);
        }
        break;
      case ChestChanceTypes.REMOVE_FUNDS :
        if(this.gameService.players[this.gameService.turn].money >= data.amount){
          this.gameService.addingRemovingMoney('remove',data.amount, 1000)
        }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], data.amount)){
          this.gameService.calculateAmountDebt(data.amount);
        }       
        break;
      case ChestChanceTypes.REMOVE_FUNDS_TO_PLAYERS :
        let removefundstoplayersAmount = 0;
        (this.gameService.players.filter((player:playerModel) => player.id != this.gameService.players[this.gameService.turn].id)).forEach(otherPlayer => {
          if(this.gameService.players[this.gameService.turn].money >= removefundstoplayersAmount){
            removefundstoplayersAmount += 50;
            this.gameService.addingRemovingMoney('add',data.amount,1000,otherPlayer)
          }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], removefundstoplayersAmount)){
            this.gameService.calculateAmountDebt(removefundstoplayersAmount, otherPlayer.id)
          }
        });

        setTimeout(() => {
          this.gameService.addingRemovingMoney('remove',removefundstoplayersAmount, 1000)
        }, 1000);

        break;
      case ChestChanceTypes.ADD_FUNDS_FROM_PLAYERS :
        let addfundsfromplayersAmount = 0;
        (this.gameService.players.filter((player:playerModel) => player.id != this.gameService.players[this.gameService.turn].id)).forEach(otherPlayer => {
          if(otherPlayer.money >= data.amount){
            addfundsfromplayersAmount += 50;
            this.gameService.addingRemovingMoney('remove',data.amount,1000,otherPlayer)
          }else if(!this.gameService.checkBankrupt(otherPlayer, data.amount)){
            this.gameService.calculateAmountDebt(data.amount, otherPlayer.id)
          }
        });
        setTimeout(() => {
          this.gameService.addingRemovingMoney('add',addfundsfromplayersAmount, 1000)
        }, 1000);


        break;
    }
  }

  closeDialog(){
    this.movedNearest = false;
    this.gameService.closeDialog(this.dialogRef);
  }

  getPlayerWhoWin(){
    return this.gameService.players.find((player:playerModel) => player.id == this.gameService.playerWhoWonId)
  }

  getActualPlayerProps(){
    return this.gameService.gameTable.cards.filter((card:cardModel) => card.owner === this.data.textData.playerId).length
  }

  executeOnlineAction(type:string){
    switch (type) {
      case 'close':
        this.closeDialog();
        break;
    
      default:
        break;
    }
  }

  ngOnDestroy(){
    this.soundService.playSound(SoundTypes.OPEN_DIALOG);
    if(this.gameService.itsMyTurn) this.gameService.setOnlineData$.next({path : '/online/message', value : {  type : MessageTypes.DIALOG_ACTION , data : { dialogType : DialogTypes.MESSAGE , actionType : DialogActionTypes.CLOSE}}});
  }
}

