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
    //this.houses.push('');
    this.data.card.housesCounter++;
    this.gameService.addingRemovingMoney('remove', this.data.card.houseCost, 250);
    //this.gameService.players[this.gameService.turn].money -= this.data.card.houseCost;
  }

  removeHouse(){
    //this.houses.splice((this.houses.length -1),1);
    this.data.card.housesCounter--;
    this.gameService.addingRemovingMoney('add', ((this.data.card.houseCost / 100) * 50), 250);
    //this.gameService.players[this.gameService.turn].money += ((this.data.card.houseCost / 100) * 50);
  }

  addHotel(){
    //this.hotel = true;
    this.data.card.hotelCounter++;
    this.gameService.addingRemovingMoney('remove', this.data.card.hotelCost, 250);
    //this.gameService.players[this.gameService.turn].money -= this.data.card.hotelCost;
  }
  removeHotel(){
    //this.hotel = false;
    this.data.card.hotelCounter--;
    this.gameService.addingRemovingMoney('add', ((this.data.card.hotelCost / 100) * 50), 250);
    //this.gameService.players[this.gameService.turn].money += ((this.data.card.hotelCost / 100) * 50);
  }

  getContrastColor(hexcolor:string){
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? 'black' : 'white';
  }
}
