import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  lobbyName:string = '';
  joinLobbyName:string = '';

  constructor(public gameService : GameService, private realTimeDb: AngularFireDatabase) { 
    //console.log('------  gameService from onlineService', this.gameService)
    //console.log('------ DB', this.realTimeDb)
  }


  createLobby(){
    //console.log('------ CREATING LOBBY')
    this.lobbyName = this.randomString(10, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    const lobby:any = {
      gameName: '',
      gameTable:{},
      players: [],
      turn:0,
      diceNumber:0,
      debt: {
        amountDebt: 0,
        debtWithWho: '',
        setDebt: false,
        amountRent: 0,
      },
      time: {
        begin: 0,
        end: 0,
        gameAmountTime:'',
      },
      playerWhoWonId : '',
      localId: '',
      online: {
        gameStatus: '',
        lobbyName: '',
        messageType:'',
        dice: {
          position: [0,0,0],
        }
      }
    }
    this.setData('', lobby);
  }

  joinLobby(){
   //console.log('------ JOINING LOBBY :', this.joinLobbyName)
   this.lobbyName = this.joinLobbyName;
   //this.start()
  }

  setData(path:string, value:any){
    this.realTimeDb.object(this.lobbyName + path).set(value);
  }

  randomString(length:number, chars:string) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }



  // start(){

  //   const propertiesToSub = [
  //     {
  //       field : 'debt',
  //       path: '/debt/',
  //     },
  //     {
  //       field : 'playerWhoWonId',
  //       path: '/playerWhoWonId/',
  //     },
      
  //     {
  //       field : 'turn',
  //       path: '/turn' ,
  //     },

  //     {
  //       field : 'diceNumber',
  //       path: '/diceNumber' ,
  //     },
  //     {
  //       field : 'time',
  //       path: '/time' ,
  //     },
  //   ]

  //   let subs: any = [];

  //   propertiesToSub.forEach(prop => {
      
  //   });
  // }

}
