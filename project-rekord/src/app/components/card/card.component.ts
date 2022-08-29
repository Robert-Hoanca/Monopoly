import { NgtLoader, NgtVector3 } from '@angular-three/core';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GameService } from 'src/app/game.service';
import { CardDialogComponent } from 'src/app/shared/card-dialog/card-dialog.component';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {
  @Input() card!: any;
  @Input() cardIndex!: any;
  cardInfoRef: MatDialogRef<any> | undefined;

  //Three js
  @Input('position') position?: NgtVector3;
  model$ = this.loader.use(GLTFLoader, '/assets/blenderModels/card/card.gltf');
  hovered = false;
  
  constructor(public dialog: MatDialog, public gameService: GameService, private loader: NgtLoader ) { }

  ngOnInit(): void {
  }
  test(){
    console.log("position",this.cardIndex)
    this.position = [3,0,0];
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
