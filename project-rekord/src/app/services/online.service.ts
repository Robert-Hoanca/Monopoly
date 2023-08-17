import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { of, take } from 'rxjs';
import { GamePhysicsService } from './game-physics.service';
import { allLobby } from '../shared/real-time-db/real-time-dv-save';
import { DialogTypes, MessageTypes } from '../enums/onlineMessageType';
import { cardModel } from '../models/card';
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

  constructor(public gameService : GameService, public gamePhysicsService : GamePhysicsService , private realTimeDb: AngularFireDatabase) { }


  createLobby(){
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
    console.log('message', message)
      switch (message.type) {
        case MessageTypes.CHANGE_TURN:
          this.gameService.turn = message.data.turn;
          this.gameService.players[this.gameService.turn].canDice = true;
          this.itsMyTurn();
          break;
        case MessageTypes.DICE_ROLL:
          this.gamePhysicsService.diceStartingFields[message.data.diceI] = message.data;
          if(message.data.diceI === (this.gamePhysicsService.diceCounter - 1)){
            this.gameService.startToDice = true;
          }
          break
        case MessageTypes.DICE_END:
          this.gameService.startToDice = false;
          break;
        case MessageTypes.CHANGE_MONEY:
          if(!this.gameService.itsMyTurn){
            const player = this.gameService.players.find(player => player.id === message.data.playerId)
            this.gameService.addingRemovingMoney(message.data.type, message.data.amount, message.data.duration, player)
          }
          break;
        case MessageTypes.CHANGE_PLAYER_POS:
          if(!this.gameService.itsMyTurn){
            this.gameService.getCardPosition(message.data.cardIndex)
          }
          break;
        case MessageTypes.OPEN_DIALOG:
          if(!this.gameService.itsMyTurn){
            switch (message.data.dialogType) {
              case DialogTypes.CARD:
                this.gameService.openCardDialog(this.gameService.gameTable.cards[message.data.cardI]);
                break;
              case DialogTypes.COMPLETED_SERIES:
                const cards = this.gameService.gameTable.cards.filter((card:cardModel) => message.data.cardsIds.includes(card.index));
                this.gameService.openCardDialog(cards);
                break;
              case DialogTypes.EXCHANGE:
                this.gameService.openExchangeDialog();
                break;
              case DialogTypes.MESSAGE:
                this.gameService.textDialog(message.data.textData, message.data.eventType)
                break;
              case DialogTypes.DICE_RES:
                // this.gamePhysicsService.diceRes = message.data.diceRes;
                // this.gamePhysicsService.showRollResults()
                break;
              default:
                break;
            }
          }
          break;
        case MessageTypes.CLOSE_DIALOG:
          let dialog;
          switch (message.data.dialogType) {
            case DialogTypes.CARD:
              dialog = this.gameService.cardDialogRef;
              break;
            case DialogTypes.COMPLETED_SERIES:
              dialog = this.gameService.completedSeriesDialogRef;
              break;
            case DialogTypes.EXCHANGE:
              dialog = this.gameService.exchangeDialogRef;
              break;
            case DialogTypes.MESSAGE:
              dialog = this.gameService.messageDialogRef;
              break;
            case DialogTypes.DICE_RES:
              dialog = this.gameService.diceResDialogRef;
              break;
            default:
              break;
          }
          this.gameService.closeDialog(dialog)
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
