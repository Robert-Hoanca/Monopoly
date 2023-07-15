import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseModeComponent } from './components/pages/choose-mode/choose-mode.component';
import { GameComponent } from './components/pages/game/game.component';
import { HomeComponent } from './components/pages/home/home.component';
import { ThemeEditorComponent } from './components/pages/theme-editor/theme-editor.component';
import { GameTableEditorComponent } from './components/pages/game-table-editor/game-table-editor.component';
import { AboutComponent } from './components/pages/about/about.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'game', component: GameComponent},
  {path: 'mode', component: ChooseModeComponent},
  {path: 'theme-editor', component: ThemeEditorComponent},
  {path: 'gameTable-editor', component: GameTableEditorComponent},
  {path: 'about', component: AboutComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
