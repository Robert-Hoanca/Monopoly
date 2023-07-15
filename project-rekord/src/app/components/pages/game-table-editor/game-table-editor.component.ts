import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/game.service';
import {doc, getDoc } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { take, timer } from 'rxjs';

@Component({
  selector: 'app-game-table-editor',
  templateUrl: './game-table-editor.component.html',
  styleUrls: ['./game-table-editor.component.scss']
})
export class GameTableEditorComponent implements OnInit {
  @ViewChild('cardEditDialogRef', { static: true }) cardEditDialogRef:any;
  @ViewChild('warningDialog', { static: true }) warningDialog:any;
  chosenMap:string = '';

  gameTable:any;

  editingCard:any;

  cardTypes:Array<any> = [
    {label: 'Start', value : 'start'},
    {label: 'Property', value : 'property'},
    {label: 'Station', value : 'station'},
    {label: 'Plant', value : 'plant'},
    {label: 'Chance', value : 'chance'},
    {label: 'Community Chest', value : 'communityChest'},
    {label: 'Taxes', value : 'taxes'},
    {label: 'Prison', value : 'prison'},
    {label: 'Park Area', value : 'parkArea'},
    {label: 'Go To Prison', value : 'goToPrison'},
  ];

  warningDialodData: any = {};

  constructor(public gameService : GameService, private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  async chooseMapToEdit(map:string){

    if(map != 'new'){

      const gameTableRef = doc(this.gameService.db, "gameTables", map);
      this.gameTable  = (await getDoc(gameTableRef)).data();
  
      this.chosenMap = map;

    }else {

      this.gameTable = {
        cards: [],
        chance: [],
        communityChest : [],
      }

      for (let index = 0; index < 40; index++) {

        if(index == 0){
          this.gameTable.cards.push({
            canBuy: false,
            cardType: "start",
            name: "Start",
            reward :  0
          })
        }else{
          this.gameTable.cards.push(
            {}
          )
        }
        
      }

      this.chosenMap = 'newMap';

    }
  }

  openEditDialog(clickedCard:any){

    this.editingCard = clickedCard;

    this.dialog.open(this.cardEditDialogRef, {
      panelClass: 'card-edit-dialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:false,
    });

  }

  deleteCard(deleteCard:any){

    const deletingCardIndex =  this.gameTable.cards.findIndex((card:any) => card === deleteCard);

    if(deleteCard){
      this.gameTable.cards[deletingCardIndex] = {};
      this.editingCard = {};

      this.closeDialog();
    }

  }

  changeCardType(newType:string){

    const cardIndex = this.gameTable.cards.findIndex( (card:any) => card == this.editingCard);

    if(cardIndex){
      this.closeDialog();

      let newCard = {};

      switch (newType){
        case 'start':
          newCard = {
            canBuy: false,
            cardType: "start",
            name: "Start",
            reward :  0
          }
          
          break;
  
        case 'property':
          newCard = {
            canBuy: true,
            cardType: "property",
            completedSeries: false,
            cost: 0,
            distrained: false,
            distrainedCost:  0,
            district: "#000",
            exchangeSelected:false,
            hotelCost: 0,
            hotelCounter: 0,
            houseCost :  0,
            housesCounter:  0,
            name:  "",
            owner:  "",
            rentCosts : {
              four: 0,
              completedSeriesBasic: 0,
              one: 0,
              normal: 0,
              hotel: 0,
              two: 0,
              three: 0
            }
          }
          
          break;
        case 'communityChest':
          newCard = {
            chests: [],
            name: "Community Chest",
            cardType: "communityChest",
            canBuy: false
          }
          
          break;
        case 'chance':
          newCard = {
            name: "Chance",
            chances: [],
            cardType: "chance",
            distrained: false,
            canBuy: false
          } 
          
          break;
        case 'taxes':
          newCard = {
            name: "Taxes",
            cardType: "taxes",
            canBuy: false,
            taxesCost: 0
        }
          
          break;
        case 'station':
          newCard = {
            exchangeSelected: false,
            canBuy: true,
            district: "station",
            name: "",
            cardType: "station",
            distrainedCost: 0,
            completedSeries: false,
            distrained: false,
            owner: "",
            rentCosts: {
                three: 0,
                two: 0,
                four: 0,
                one: 0
            },
            cost: 0
        }
          
          break;
        case 'prison':
          newCard = {
            name: "Prison Area",
            cardType: "prison",
            canBuy: false
        }
          
          break;
        case 'parkArea':
          newCard = {
            name: "Parking Area",
            cardType: "parkArea",
            canBuy: false
          }
          
          break;
        case 'goToPrison':
          newCard = {
            name: "Prison",
            cardType: "goToPrison",
            canBuy: false
          }
          
          break;
        case 'plant':
          newCard = {
            cardType: "plant",
            canBuy: true,
            exchangeSelected: false,
            distrained: false,
            cost: 0,
            district: "plant",
            name: "",
            completedSeries: false,
            distrainedCost: 0,
            owner: ""
          }
          
          break;
        default:
          break;
      }

      this.gameTable.cards[cardIndex] = newCard;
      this.editingCard = {};
    }
  }

  ifCantBeMoreThanOne(type:string){

    switch (type) {
      case 'start':
        return (type === 'start') && (this.gameTable.cards.find( (card:any) => card.cardType === 'start')) ? true : false;
      case 'prison':
        return (type === 'prison') && (this.gameTable.cards.find( (card:any) => card.cardType === 'prison')) ? true : false;
      case 'station':
        return (this.gameTable.cards.filter( (card:any) => card.cardType === 'station')).length == 4 ? true : false;
    
      default:
        return false;
    }

  }

  closeDialog(){
    this.dialog.closeAll();
  }

  saveToDb(){
    const foundPrison = this.gameTable.cards.filter((card: { cardType: string; }) => card.cardType === 'prison').length ? true : false;
    const foundGoToPrisonCell = this.gameTable.cards.filter((card: { cardType: string; }) => card.cardType === 'goToPrison').length ? true : false;;

    if(foundPrison && foundGoToPrisonCell){
      if(this.chosenMap !== 'newMap'){
        this.gameService.saveMapToDb(this.chosenMap , this.gameTable);
        this.openWarningDialog('save', 'Saved ' + this.chosenMap)
      }
    }else{
      this.openWarningDialog('saveFail', 'There is a problem, check if you have setted at least one "prison-area" card and one "go-to-prison" card')
    }
    
  }

  openWarningDialog(type:string, text:string){
    this.warningDialodData = {
      text: text,
      type: type
    }
    this.dialog.open(this.warningDialog, {
      panelClass: 'warning-delete-dialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:true,
    });

    if(type ==='save'){
      timer(1000).pipe(take(1)).subscribe({
        complete: () => {
          this.closeDialog()
        }
      })
    }
    
  }

  async deleteMapFromDB(){

    if(this.chosenMap !== 'newMap'){
      this.gameService.deleteMapFromDb(this.chosenMap);
      await this.gameService.getGameMaps();
      this.chosenMap = '';
    }
    this.closeDialog();

  }

}
