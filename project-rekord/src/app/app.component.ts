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

  async ngOnInit(){
    await this.gameService.retrieveDBData();
    this.gameService.chooseSessionColor();
    this.gameService.loading = true;
    setTimeout(() => {
    this.gameService.switchRouter('home')
    }, 1500);
  }
}
