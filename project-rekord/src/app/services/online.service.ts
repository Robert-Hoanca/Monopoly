import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  lobbyName:string = '';
  joinLobbyName:string = '';

  constructor(public gameService : GameService) { 
    //console.log('gameService from onlineService', this.gameService)
  }


  createLobby(){
    //console.log('------ CREATING LOBBY')
  }

  joinLobby(){
   // console.log('------ JOINING LOBBY :', this.joinLobbyName)
  }
}
