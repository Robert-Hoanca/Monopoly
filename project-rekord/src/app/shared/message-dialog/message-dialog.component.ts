import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { GameService } from 'src/app/game.service';
import { CardDialogComponent } from '../card-dialog/card-dialog.component';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  getCardPosition$ = new Subject();
  movedNearest:boolean=false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<CardDialogComponent>, public gameService: GameService) { }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(){
  }

  executeAndClose(){
    switch(this.data.eventType){
      case 'payMoney':
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
          this.gameService.nextTurn();
        }else if(this.data.textData.amountDebt && ((this.data.textData.playerId? this.gameService.players.find(player => player.id == this.data.textData.playerId) : this.gameService.players[this.gameService.turn]).money >= this.data.textData.amountDebt) && this.data.textData.debtWithWho == 'bank' && !this.gameService.checkBankrupt((this.data.textData.playerId? this.gameService.players.find(player => player.id == this.data.textData.playerId) : this.gameService.players[this.gameService.turn]),this.data.textData.amountDebt)){
          this.data.textData.playerId? this.gameService.addingRemovingMoney('remove', this.data.textData.amountDebt, 1000 ,this.gameService.players.find(player => player.id == this.data.textData.playerId)) : this.gameService.addingRemovingMoney('remove', this.data.textData.amountDebt, 1000);
          this.gameService.debtWithWho = '';
          this.gameService.amountDebt = 0;
          this.gameService.nextTurn();
        }
        if(this.gameService.setDebt){this.gameService.setDebt = false}

        break;
      case 'chance':
        this.calculateChestChance(this.data.textData);
        break;
      case 'communityChest':
        this.calculateChestChance(this.data.textData);
        break;
       case 'goingToPrison':
        this.gameService.goToPrison();
        break;
      case 'exitFromPrison':

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
      case 'backrupt':
        this.gameService.players.find(player => player.id == this.data.textData.player.id).bankrupt = true;
        this.gameService.players.find(player => player.id == this.data.textData.player.id).money = 0;
        this.gameService.gameTable.cards.filter((card: { id: any; }) => card.id == this.data.textData.player.id).forEach((prop:any) => {
          prop.owner = this.data.textData.playerToPay;
          this.gameService.checkCompletedSeries(prop,this.data.textData.playerToPay)
        });
        this.gameService.checkIfSomeoneWon();
        break;
      case 'goBankRupt':
        this.gameService.goBankRupt();
        break;
    }
    this.closeDialog();
    
  }

  calculateChestChance(data:any){
    switch(data.action){
      case 'move':
        if(data.cardIndex != undefined && data.cardIndex != null){
          this.gameService.getCardPosition(data.cardIndex)
        }else if(data.count != undefined && data.count != null){
          this.gameService.getCardPosition((this.gameService.players[this.gameService.turn].actualCard + (data.count)));
        }
        break;
      case 'movenearest': //Maybe add multiply option in future
        this.gameService.gameTable.cards.forEach((nearProp: { cardType: any; }, index: number) => {
          if(nearProp.cardType == data.groupid && index > this.gameService.players[this.gameService.turn].actualCard && !this.movedNearest){
            this.gameService.getCardPosition(index);
            this.movedNearest = true;
          }
        });
        break;
      case 'addfunds':
        this.gameService.addingRemovingMoney('add', data.amount, 1000)
        break;
      case 'jail':
        if(data.subaction == 'getout'){
          this.gameService.players[this.gameService.turn].prison.getOutCards ++;
        }else if(data.subaction == 'goto'){
          this.closeDialog();
          this.gameService.textDialog({text: this.gameService.players[this.gameService.turn].name + ' is going to prison.'}, 'goingToPrison');
        }
        break;
      case 'propertycharges':
        let amount = 0;
        let housesC = 0;
        let hotelC = 0;
        (this.gameService.gameTable.cards.filter((card: { owner: any; }) => card.owner == this.gameService.players[this.gameService.turn].id)).forEach((card: { hotelCounter: any; housesCounter: number; }) => {
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
      case 'removefunds':
        if(this.gameService.players[this.gameService.turn].money >= data.amount){
          this.gameService.addingRemovingMoney('remove',data.amount, 1000)
        }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], data.amount)){
          this.gameService.calculateAmountDebt(data.amount);
        }       
        break;
      case 'removefundstoplayers':
        (this.gameService.players.filter(player => player.id != this.gameService.players[this.gameService.turn].id)).forEach((otherPlayer: { money: any; }) => {
         
          if(this.gameService.players[this.gameService.turn].money >= data.amount){
            this.gameService.addingRemovingMoney('remove',data.amount, 1000)
          }else if(!this.gameService.checkBankrupt(this.gameService.players[this.gameService.turn], data.amount)){
            this.gameService.calculateAmountDebt(data.amount);
          }
          this.gameService.addingRemovingMoney('add',data.amount, 1000, otherPlayer)
          
        });
        break;
      case 'addfundsfromplayers':
        (this.gameService.players.filter(player => player.id != this.gameService.players[this.gameService.turn].id)).forEach((otherPlayer:any ) => {
          if(otherPlayer.money >= data.amount){
            this.gameService.addingRemovingMoney('remove',data.amount,otherPlayer)
            this.gameService.addingRemovingMoney('add', data.amount, 1000)
          }else if(!this.gameService.checkBankrupt(otherPlayer, data.amount)){
            this.gameService.calculateAmountDebt(data.amount)
          }
        });
        break;
    }
  }

  closeDialog(){
    this.movedNearest = false;
    this.dialogRef.close();
  }

  getPlayerWhoWin(){
    return this.gameService.players.find(player => player.id == this.gameService.playerWhoWonId)
  }
}

