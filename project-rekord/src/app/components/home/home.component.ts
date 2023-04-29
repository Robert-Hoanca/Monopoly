import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('godModeDialogRef', { static: true }) godModeDialogRef:any;
  
  enableSettingsView:boolean = false;

  godPassword:string = '';

  errorGodMode:boolean = false;

  constructor(public router: Router, public gameService: GameService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.gameService.retrieveSavesFromLocal()
    if(window.navigator.userAgent.includes('Android')){
      this.gameService.userDevice = 'phone_android'
    }else if(window.navigator.userAgent.includes('Windows')){
      this.gameService.userDevice = 'computer_windows'
    }else if(window.navigator.userAgent.includes('iPhone')){
      this.gameService.userDevice = 'phone_ios'
    }
    /*
    to do mac
    lse if(window.navigator.userAgent.includes('Windows')){
      this.gameService.userDevice = 'computer_windows'
    }
    */
  }

  goToChooseModeView(){
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
}
