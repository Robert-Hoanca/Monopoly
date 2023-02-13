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
    this.router.navigateByUrl('home', { skipLocationChange: true })
    await this.gameService.retrieveDBData();
    this.gameService.chooseSessionColor();
  }
}
