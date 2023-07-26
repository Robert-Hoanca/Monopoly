import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { take } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  lobbyName:string = '';
  joinLobbyName:string = '';

  lobbySubs$: Array<any> = [];

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
      players: [{},{},{},{}],
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
        gameStatus: 'inLobby',
        messageType:'',
        data: {},
        dice: {
          position: [0,0,0],
          rotation: [0,0,0],
        }
      }
    }
    this.setData('', lobby);
    this.enableLobbySubs()
  }

  joinLobby(){
    this.gameService.loading = true;
    this.lobbyName = this.joinLobbyName;
    this.enableLobbySubs();
    this.realTimeDb.object(this.lobbyName + '/online/gameStatus').valueChanges().pipe(take(1)).subscribe((data:any) => {
      if(data){
        this.gameService.onlineGameStatus = data;
      }

      if( this.gameService.onlineGameStatus === 'inGame'){
        //console.log('starting game...')
        this.startGame()
       }
    })

    
  }

  setData(path:string, value:any){
    this.realTimeDb.object(this.lobbyName + path).set(value);
  }

  randomString(length:number, chars:string) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }



  enableLobbySubs(){

    this.lobbySubs$.push(
      this.realTimeDb.object(this.lobbyName + '/players').valueChanges().pipe().subscribe((data:any) => {
        //console.log('players',data);
        if(data){
          this.gameService.players = data
        }
      })
    )

    this.lobbySubs$.push(
      this.realTimeDb.object(this.lobbyName + '/online/gameStatus').valueChanges().pipe().subscribe((data:any) => {
       // console.log('gameStatus',data);
        if(data){
          this.gameService.onlineGameStatus = data
        }
      })
    )

    this.realTimeDb.object(this.lobbyName + '/gameTable').valueChanges().pipe(take(2)).subscribe((data:any) => {
      console.log('gameTable',data);
      if(data){
        this.gameService.gameTable = data
      }
    })

    
  }


  enableInGameObs(){

    this.realTimeDb.object(this.lobbyName + 'online/messageType').valueChanges().subscribe(data => {
      //console.log('messageType',data)
    })

    this.realTimeDb.object(this.lobbyName + 'online/dice/position').valueChanges().subscribe(data => {
      //console.log('Dice Position',data)
    })

    this.realTimeDb.object(this.lobbyName + 'online/dice/rotation').valueChanges().subscribe(data => {
      //console.log('Dice Rotation',data)
    })

    this.lobbySubs$.forEach(sub => {
      sub.unsubscribe();
    });
    

  }

  startGame(){
    if(this.gameService.onlineGameStatus === 'inLobby'){
      this.gameService.setOnlineData$.next({path: '/online/gameStatus', value : 'inGame'})
    }
    this.enableInGameObs();
    this.gameService.startGame()
  }
}
