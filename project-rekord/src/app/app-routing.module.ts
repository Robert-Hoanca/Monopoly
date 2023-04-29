import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseModeComponent } from './components/choose-mode/choose-mode.component';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';
import { ThemeEditorComponent } from './components/theme-editor/theme-editor.component';
import { GameTableEditorComponent } from './components/game-table-editor/game-table-editor.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'game', component: GameComponent},
  {path: 'mode', component: ChooseModeComponent},
  {path: 'theme-editor', component: ThemeEditorComponent},
  {path: 'gameTable-editor', component: GameTableEditorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
