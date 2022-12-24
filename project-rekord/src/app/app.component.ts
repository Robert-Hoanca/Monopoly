import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from './game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'monopoly';
  constructor(public router: Router,public gameService: GameService){}

  ngOnInit(){
    //this.gameService.chooseColor();
    this.router.navigateByUrl('home', { skipLocationChange: true })
    this.gameService.retrieveDBData();
    //sessionStorage.getItem('alreadyExistingMatch')?  this.router.navigateByUrl('game', { skipLocationChange: true }) :  this.router.navigateByUrl('home', { skipLocationChange: true });

  }
}
