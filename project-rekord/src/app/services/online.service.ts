import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { of, take } from 'rxjs';
import { GamePhysicsService } from './game-physics.service';
import { allLobby } from '../shared/real-time-db/real-time-dv-save';
@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  lobbyName:string = '';
  joinLobbyName:string = '';

  onlineData:any = {}

  //Subs
  lobbySubs$: Array<any> = [];
  inGameSubs$: Array<any> = [];

  constructor(public gameService : GameService, public gamePhysicsService : GamePhysicsService , private realTimeDb: AngularFireDatabase) { 
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
        message: {
          type : '',
          data : {}
        },
        playersIds : []
      }
    }
    this.setData('', lobby);
    this.enableLobbySubs();
    this.gameService.imLobbyMaster = true;
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

  getData(path:string){
    this.realTimeDb.object(this.lobbyName + path).valueChanges().pipe(take(1)).subscribe(data => {

    });
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
          this.gameService.onlineGameStatus = data;
          if(data === 'inGame'){
            this.startGame()
          }
        }
      })
    )

    this.realTimeDb.object(this.lobbyName + '/gameTable').valueChanges().pipe(take(2)).subscribe((data:any) => {
      if(data){
        this.gameService.gameTable = data
      }
    })

    this.inGameSubs$.push(
      this.realTimeDb.object(this.lobbyName + '/online').valueChanges().pipe().subscribe((data:any) => {
       // console.log('gameStatus',data);
        if(data){
          this.onlineData = data;
        }
      })
    )
  }


  enableInGameObs(){

    this.realTimeDb.object(this.lobbyName + '/online/message').valueChanges().subscribe(data => {
      this.handleMessages(data);
    })

    this.realTimeDb.object(this.lobbyName + '/online/dices/0/position').valueChanges().subscribe(data => {
      this.handleMessages({type : 'dice-pos', data : data, diceI : 0});
    })

    this.realTimeDb.object(this.lobbyName + '/online/dices/1/position').valueChanges().subscribe(data => {
      this.handleMessages({type : 'dice-pos', data : data, diceI : 1});
    })

    this.realTimeDb.object(this.lobbyName + '/online/dices/0/rotation').valueChanges().subscribe(data => {
      //console.log('Dice Rotation',data)
      this.handleMessages({type : 'dice-rot', data : data, diceI : 0});
    })
    this.realTimeDb.object(this.lobbyName + '/online/dices/1/rotation').valueChanges().subscribe(data => {
      //console.log('Dice Rotation',data)
      this.handleMessages({type : 'dice-rot', data : data, diceI : 1});
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

  handleMessages(message:any){
      switch (message.type) {
        case 'change-turn':
          this.gameService.turn = message.data.turn;
          this.gameService.players[this.gameService.turn].canDice = true;
          this.itsMyTurn();
          break;
        case 'dice-roll':
          this.gamePhysicsService.diceStartingFields[message.data.diceI] = message.data;
          if(message.data.diceI === this.gamePhysicsService.diceCounter < 1){
            this.gameService.startToDice = true;
          }
          break
        case 'dice-end':
          this.gameService.startToDice = false;
          break;
        case 'change-money':
          if(!this.gameService.itsMyTurn){
            const player = this.gameService.players.find(player => player.id === message.data.playerId)
            this.gameService.addingRemovingMoney(message.data.type, message.data.amount, message.data.duration, player)
          }
          break;
        case 'change-player-pos':
          if(!this.gameService.itsMyTurn){
            this.gameService.getCardPosition(message.data.cardIndex)
          }
          break;
        default:
          break;
    }
  }

  itsMyTurn(){
    if(this.gameService.choosenMode === 'local' || 
    (this.gameService.choosenMode === 'online' && this.onlineData?.playersId?.find((player:any) => player.id === this.gameService.players[this.gameService.turn].id && player.uuid === this.gameService.currentUUID))){
      this.gameService.itsMyTurn = true;
      return true;
    }else{
      this.gameService.itsMyTurn = false;
      return false;
    }
  }


  clearAllDatabase(){
    const lobbys:any = allLobby;
    for (const [key] of Object.entries(lobbys)) {
      this.realTimeDb.object(key).remove();
    }
  }
}
