import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/game.service';

@Component({
  selector: 'app-theme-editor',
  templateUrl: './theme-editor.component.html',
  styleUrls: ['./theme-editor.component.scss']
})
export class ThemeEditorComponent implements OnInit {

  constructor(public gameService: GameService) { }

  ngOnInit(): void {
  }

}
