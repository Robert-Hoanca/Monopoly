import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChooseModeComponent } from './components/choose-mode/choose-mode.component';
import { GameComponent } from './components/game/game.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'game', component: GameComponent},
  {path: 'mode', component: ChooseModeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
