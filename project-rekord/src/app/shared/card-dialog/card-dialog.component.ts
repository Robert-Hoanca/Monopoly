import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-card-dialog',
  templateUrl: './card-dialog.component.html',
  styleUrls: ['./card-dialog.component.scss']
})
export class CardDialogComponent implements OnInit {
  houses:Array<string> = [];
  hotel:boolean=false;

  constructor( @Inject(MAT_DIALOG_DATA) public data: any,  public dialogRef: MatDialogRef<CardDialogComponent>, public gameService: GameService) { }

  ngOnInit(): void {
    this.counterHouses();
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
    this.houses.push('');
    this.data.card.housesCounter++;
    this.gameService.actualTurnPlayer.money -= this.data.card.houseCost;
  }

  removeHouse(){
    this.houses.splice((this.houses.length -1),1);
    this.data.card.housesCounter--;
    this.gameService.actualTurnPlayer.money += ((this.data.card.houseCost / 100) * 50);
  }

  addHotel(){
    this.hotel = true;
    this.data.card.hotelCounter++;
    this.gameService.actualTurnPlayer.money -= this.data.card.hotelCost;
  }
  removeHotel(){
    this.hotel = false;
    this.data.card.hotelCounter--;
    this.gameService.actualTurnPlayer.money += ((this.data.card.hotelCost / 100) * 50);
  }
}
