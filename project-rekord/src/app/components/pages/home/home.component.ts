import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameService } from 'src/app/game.service';
import {  doc, getDoc } from '@angular/fire/firestore';
import { switchMap, take, tap, timer } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { SoundService } from 'src/app/sound.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger(
      'AnimationScale',
      [
        transition(
          ':enter', [
          style({ height: '0' , opacity : '0'}),
          animate('0.2s ease-in', style({height: '*' , opacity : '1'}))
        ]
        ),
        transition(
          ':leave', [
          style({height: '*' , opacity : '1'}),
          animate('0.2s ease-out', style({ height: '*' , opacity : '0' }))
        ])
      ]
    ),
  ]
})
export class HomeComponent implements OnInit {
  
  // @ViewChild('canvas', { static: true }) canvas:any;
  // @ViewChild('scene', { static: true }) scene:any;

  // @ViewChild('camera', { static: true }) camera:any;

  // homeGameTable:any = [];

  // homeCameraDistance:number = 30;

  @ViewChild('godModeDialogRef', { static: true }) godModeDialogRef:any;
  
  // @ViewChild('infoDialogRef', { static: true }) infoDialogRef:any;
  enabledAboutPage:boolean = false;
  
  enableSettingsView:boolean = false;

  godPassword:string = '';

  errorGodMode:boolean = false;

  choosingMode:boolean = false;


  constructor(public router: Router, public gameService: GameService, private dialog: MatDialog, public soundService : SoundService) { }

  async ngOnInit(): Promise<void> {
    this.gameService.retrieveSavesFromLocal()
    if(window.navigator.userAgent.includes('Android')){
      this.gameService.userDevice = 'phone_android'
    }else if(window.navigator.userAgent.includes('Windows')){
      this.gameService.userDevice = 'computer_windows'
    }else if(window.navigator.userAgent.includes('iPhone')){
      this.gameService.userDevice = 'phone_ios'
    }

    // this.homeCameraDistance = this.gameService.userDevice.includes('phone') ? 50 : 30;

    // const gameTableRef = doc(this.gameService.db, "gameTables", 'monopolyMap');
    // this.homeGameTable = (await getDoc(gameTableRef)).data();

    // let evt =  new WheelEvent("wheel", {deltaY:10});
    // document.querySelector("canvas")?.dispatchEvent(evt);
    /*
    to do mac
    lse if(window.navigator.userAgent.includes('Windows')){
      this.gameService.userDevice = 'computer_windows'
    }
    */
  }

  ngAfterViewInit(){
  }

  goToChooseModeView(){
    this.soundService.initializeAudioContext()
    this.choosingMode = true;
  }

  chooseMode(mode:string){
    this.gameService.choosenMode = mode;
    this.gameService.switchRouter('mode')
  }

  returnSessionBg(){
    return this.gameService.sessionTheme && this.gameService.sessionTheme.background ? this.gameService.sessionTheme.background : '#fff';
  }

  returnSessionColor(){
    return this.gameService.sessionTheme && this.gameService.sessionTheme.background ? this.gameService.getContrastColor(this.gameService.sessionTheme.background) : '#000'
  }

  openGodModePopup(){
    
    this.dialog.open(this.godModeDialogRef, {
      panelClass: 'god-mode-dialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:false,
    });

  }

  tryToGoGodMode(){

    if(this.gameService.godData.passwords.find((password:string) => password === this.godPassword)){
      this.dialog.closeAll();
      this.gameService.godMode = true;
      localStorage.setItem('monopolyGodMode', JSON.stringify(this.gameService.godMode));
    }else{
      this.errorGodMode = true;

      timer(2000).pipe(
        tap(() => {

          this.dialog.closeAll();

        }), 
        switchMap( (data:any):any =>{

          return timer(500)

        }),
        take(1)).subscribe({
        complete : () => {
          this.errorGodMode = false;
        }
      });
    }
  }

  resizeCanvas(event:any){
    event.renderer.setSize( window.innerWidth, window.innerHeight );
  }

}
