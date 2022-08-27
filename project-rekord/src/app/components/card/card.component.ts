import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameService } from 'src/app/game.service';
import { CardDialogComponent } from 'src/app/shared/card-dialog/card-dialog.component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: any;
  @Input() cardIndex!: any;
  cardInfoRef: MatDialogRef<any> | undefined;
  constructor(public dialog: MatDialog, public gameService: GameService) { }

  ngOnInit(): void {
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
