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
  }

  goToChooseModeView(){
    this.router.navigateByUrl('mode', { skipLocationChange: true });
  }

}
