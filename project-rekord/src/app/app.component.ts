import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from './services/game.service';
import { DecorationsService } from './services/decorations.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'monopoly';
  constructor(public router: Router,public gameService: GameService , public decorationsService: DecorationsService){}

  async ngOnInit(){
    await this.gameService.retrieveDBData();
    this.gameService.chooseSessionColor();
    this.decorationsService.chooseDecorations();
    this.gameService.loading = true;
    this.gameService.switchRouter('home')
  }
}
