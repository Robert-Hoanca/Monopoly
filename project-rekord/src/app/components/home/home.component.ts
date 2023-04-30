import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameService } from 'src/app/game.service';
import {  doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  
  @ViewChild('canvas', { static: true }) canvas:any;
  @ViewChild('scene', { static: true }) scene:any;

  @ViewChild('camera', { static: true }) camera:any;

  @ViewChild('godModeDialogRef', { static: true }) godModeDialogRef:any;

  
  @ViewChild('infoDialogRef', { static: true }) infoDialogRef:any;
  
  enableSettingsView:boolean = false;

  godPassword:string = '';

  errorGodMode:boolean = false;

  homeGameTable:any = [];

  homeCameraDistance:number = 30;

  constructor(public router: Router, public gameService: GameService, private dialog: MatDialog) { }

  async ngOnInit(): Promise<void> {
    this.gameService.retrieveSavesFromLocal()
    if(window.navigator.userAgent.includes('Android')){
      this.gameService.userDevice = 'phone_android'
    }else if(window.navigator.userAgent.includes('Windows')){
      this.gameService.userDevice = 'computer_windows'
    }else if(window.navigator.userAgent.includes('iPhone')){
      this.gameService.userDevice = 'phone_ios'
    }
    this.homeCameraDistance = this.gameService.userDevice.includes('phone') ? 50 : 30;

    const gameTableRef = doc(this.gameService.db, "gameTables", 'monopolyMap');
    this.homeGameTable = (await getDoc(gameTableRef)).data();

    let evt =  new WheelEvent("wheel", {deltaY:10});
    document.querySelector("canvas")?.dispatchEvent(evt);
    /*
    to do mac
    lse if(window.navigator.userAgent.includes('Windows')){
      this.gameService.userDevice = 'computer_windows'
    }
    */

  }

  goToChooseModeView(){
    this.gameService.cardsPositionCounter = 0;
    this.homeGameTable = {};
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
      setTimeout(() => {
        this.dialog.closeAll();

        setTimeout(() => {
          this.errorGodMode = false;
        }, 500);
      }, 2000);
    }
  }

  resizeCanvas(event:any){
    event.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  openInfoPopup(){

    this.dialog.open(this.infoDialogRef, {
      panelClass: 'home-info-dialog',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:false,
    });

  }
}
