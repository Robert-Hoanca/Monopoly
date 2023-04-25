import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseModeComponent } from './components/choose-mode/choose-mode.component';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';
import { ThemeEditorComponent } from './components/theme-editor/theme-editor.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'game', component: GameComponent},
  {path: 'mode', component: ChooseModeComponent},
  {path: 'theme-editor', component: ThemeEditorComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
