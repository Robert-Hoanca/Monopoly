import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss'],
  animations: [
    trigger(
      'AnimationGrowWidth',
      [
        transition(
          ':enter', [
          style({ width: '0' }),
          animate('1.5s ease-in', style({ width: '*' }))
        ]
        ),
        transition(
          ':leave', [
          style({ width: '*' }),
          animate('1.5s ease-out', style({ width: '0' }))
        ])
      ]
    ),
  ]
})
export class LoadingScreenComponent implements OnInit {

  constructor(public gameService:GameService) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.gameService.loading = false;
    }, 1500);
  }
}
