import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(public router: Router, public gameService: GameService) { }

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
}
