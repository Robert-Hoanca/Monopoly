
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { GameService } from 'src/app/game.service';
import { CardDialogComponent } from 'src/app/shared/card-dialog/card-dialog.component';
import { Vector3 } from 'three';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: any;
  @Input() cardIndex!: any;
  cardInfoRef: MatDialogRef<any> | undefined;
  url:string= '';
  position: [x: number, y: number, z: number] = [0, 0, 0];
  rotation: [x: number, y: number, z: number] = [0, 0, 0];
  meshColor:string='#ffff00';
  getCardPosition$: Subscription | undefined;

  constructor(public dialog: MatDialog, public gameService: GameService, ) { }

  ngOnInit(): void {
    this.url= (this.cardIndex/10) % 1 == 0 ? '/assets/blenderModels/card/card_corner.gltf':'/assets/blenderModels/card/card.gltf';
    this.setCardPosition();
    this.getCardPosition$ = this.gameService.getCardPosition$.subscribe((diceNumber:any) =>{
      if(diceNumber == this.cardIndex){
        this.gameService.actualTurnPlayer.pawn.position =  this.position;
        //this.gameService.actualTurnPlayer.pawn.rotation = this.rotation;


        //this.gameService.cameraPosition[0] = this.position[0];

        this.gameService.cameraPosition = [  (this.gameService.cameraPosition[0] + 0.01), this.gameService.cameraPosition[1], this.position[2]]
      }
    });
  }
  test(){
    console.log()
  }

  setCardPosition(){
    if(this.cardIndex==11 || this.cardIndex==21 || this.cardIndex==31){
      this.gameService.cardsPositionCounter = 0;
    }
    this.gameService.cardsPositionCounter += (this.cardIndex/10) % 1 == 0 ? 1.5 : 1 + 1;

     if(this.cardIndex <= 10){
      this.position = [ this.gameService.cardsPositionCounter,0,0];
    }else  if(10 < this.cardIndex && this.cardIndex <= 20){
      this.position = [21,0,this.gameService.cardsPositionCounter];
      this.rotation = [0,(Math.PI / 2),0]
    }else  if(20 < this.cardIndex && this.cardIndex <= 30){
      this.position = [(21 - this.gameService.cardsPositionCounter),0,19.5];
    }else  if(30 < this.cardIndex && this.cardIndex <= 40){
      this.position = [1.5,0,(19.5-this.gameService.cardsPositionCounter)];
      this.rotation = [0,(Math.PI / 2),0];
    }
   
  }

  openDialog(){
    this.cardInfoRef = this.dialog.open(CardDialogComponent, {
      width: '450px',
      panelClass: 'cardInfo',
      hasBackdrop: true,
      autoFocus: false,
      data: {
        card:this.card,
      }
    });
  }
}
