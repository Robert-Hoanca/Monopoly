import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-choose-mode',
  templateUrl: './choose-mode.component.html',
  styleUrls: ['./choose-mode.component.scss'],
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
export class ChooseModeComponent implements OnInit {

  pawnModelCounter:number=0;
  playerName:string='';
  actualPawnDisplayer:string = '';
  canAddSpecial:boolean=false;
  specialPawnExist:boolean = false;

  chosenSaveName:string = '';

  url:string='';

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }
  chooseMode(mode:string){
    this.gameService.choosenMode = mode;
  }

  changeModel(way:string,){
    if(way == 'minus'){
      this.pawnModelCounter--;
    }else if(way == 'plus'){
      this.pawnModelCounter++;
    }
  }

  disableJoinButton(){

    const specialPawnIndex= this.gameService.specialPawnTypes.findIndex((pawn: { value: String; }) => pawn.value == this.gameService.specialPawn);
    if(!this.gameService.specialPawn && this.playerName){
      return false;
    }else if(this.gameService.specialPawn && this.playerName && specialPawnIndex>-1){
      return false;
    }else{
      return true;
    }
  }

  createPlayer(){
    this.playerName = '';
    this.pawnModelCounter = 0;

  }

  filterPawns(){
    return this.gameService.pawnTypes.filter((pawn: { specialPawn: any; }) => !pawn.specialPawn)
  }

  selectSaveName(index:number, saveFile:any){
   
  }

  createOrUploadGame(saveFile:any,index:number){
    if(saveFile == 'new'){
      this.gameService.localSave.localId = 'rekordLocalSave' + index;
      this.gameService.localSaves = saveFile;
    }else{
      this.gameService.localSaves = saveFile;
      this.gameService.startGame()
    }
  }

  deleteSaveFile(saveFile:any){
    if(saveFile != 'new'){
      localStorage.removeItem(saveFile.localId);
      this.gameService.retrieveSavesFromLocal()
    }
  }

  calculateGameTime(save:any){
    var dateFormat = new Date(save.time.begin);
    return dateFormat.getDate() + ' / ' + dateFormat.getMonth() + ' / ' + dateFormat.getFullYear();
  }

}
