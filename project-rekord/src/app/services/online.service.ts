import { Injectable } from '@angular/core';
import { GameService } from './game.service';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { EMPTY, Subscription, concat, concatMap, switchMap, take, tap } from 'rxjs';
import { GamePhysicsService } from './game-physics.service';
import { allLobby } from '../shared/real-time-db/real-time-db-save';
import { DialogTypes, MessageTypes } from '../enums/onlineMessageType';
import { playerModel } from '../models/player';
import { EventTypes } from '../enums/eventTypes';
import { onlineStatus } from '../enums/online';
@Injectable({
  providedIn: 'root'
})
export class OnlineService {

  lobbyName:string = '';
  joinLobbyName:string = '';

  onlineData:any = {}

  //Subs
  subscriptions$: Array<Subscription> = [];

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
        gameStatus: onlineStatus.IN_LOBBY,
        message: {
          type : '',
          data : {}
        },
        playersIds : []
      }
    }
    this.setData('', lobby);
    this.gameService.imLobbyMaster = true;
    
    //Listen for players and onlineData changes while on lobby to update correctly the template.
    this.subscriptions$.push(
      this.realTimeDb.object(this.lobbyName + '/players').valueChanges().pipe(tap( (data:any) => {
        if(data)  this.gameService.players = data;
      })).subscribe(),
      this.realTimeDb.object(this.lobbyName + '/online').valueChanges().pipe(tap( data => {
        if(data) this.onlineData = data;
      })).subscribe()
    )
  }

  joinLobby(){
    this.gameService.loading = true;
    this.lobbyName = this.joinLobbyName;
    this.loadData()
  }

  retrieveData(){
    this.subscriptions$.forEach(sub => {
      sub.unsubscribe();
    });
    return concat(
      //Get gameTable
      this.realTimeDb.object(this.lobbyName + '/gameTable').valueChanges().pipe(tap( (data:any) => {
        if(data) this.gameService.gameTable = data
      }), switchMap( () => {
      //Get players
      return this.realTimeDb.object(this.lobbyName + '/players').valueChanges().pipe(take(1),tap( (data:any) => {
        if(this.gameService.players.length === 0){
          this.gameService.players = data;
        }
      }));
      }
      ), switchMap(() => {
        return this.realTimeDb.object(this.lobbyName + '/online').valueChanges().pipe(tap( data => {
          if(data) this.onlineData = data;
        }), take(1))
      }), switchMap(() => {
        return this.realTimeDb.object(this.lobbyName + '/online/gameStatus').valueChanges().pipe(tap( (data:any) => {
          if(data){
            this.gameService.onlineGameStatus = data;
            if(data === onlineStatus.IN_GAME) {
              this.joinGame();
            }
          }
        }), take(1))
      }))
    ).pipe(
      concatMap( () => {
        //When starting search if can set player status to connected
        return this.realTimeDb.object(this.lobbyName + '/online/playersId').valueChanges().pipe(tap(() => {
          if(this.onlineData.playersId && this.gameService.onlineGameStatus === onlineStatus.IN_GAME){
            const playerId = this.onlineData.playersId.find((player:any) => player.uuid === this.gameService.currentUUID).id;
            const playerIndex = this.gameService.players.findIndex((player:playerModel) => player.id === playerId);
            this.gameService.setOnlineData$.next({path: '/online/playersId/' + playerIndex + '/status', value : 'connected'});
          }
          this.enableSubs();
        }), take(1));
      }),
    )
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

  enableSubs(){
    //Update local saved onlineData
    this.realTimeDb.object(this.lobbyName + '/online').valueChanges().pipe(tap( data => {
      if(data) this.onlineData = data;
    })).subscribe();

    //Listen for game Messages 
    this.realTimeDb.object(this.lobbyName + '/online/message').valueChanges().subscribe(data => {
      if(data) this.handleMessages(data);
    })

  }

  loadData(){

    this.realTimeDb.object(this.lobbyName + '/online/gameStatus').valueChanges().pipe(tap( (data:any) => {
      if(data) this.gameService.onlineGameStatus = data;
    }), switchMap(() => {

      if(this.gameService.onlineGameStatus === onlineStatus.IN_LOBBY && this.joinLobbyName !== ''){

        //Listen for players and onlineData changes while on lobby to update correctly the template.
        this.subscriptions$.push(this.realTimeDb.object(this.lobbyName + '/players').valueChanges().pipe(tap( (data:any) => {
          if(data && this.gameService.onlineGameStatus === onlineStatus.IN_LOBBY) this.gameService.players = data;
        })).subscribe(),
        this.realTimeDb.object(this.lobbyName + '/online').valueChanges().pipe(tap( data => {
          if(data) this.onlineData = data;
        })).subscribe())

      }else if(this.gameService.onlineGameStatus === onlineStatus.IN_GAME){
        return this.retrieveData().pipe(
          take(1),
          concatMap( () => {   
            //When a player status changed check if someone is disconnected, if so show a message.
            return this.realTimeDb.object(this.lobbyName + '/online/playersId').valueChanges().pipe( tap( ( data:any) => {
            if(data){
              const notActivePlayers = data.filter((player:any) => player.status === 'disconnected' && player.uuid !== this.gameService.currentUUID);
              if(notActivePlayers.length && !this.gameService.disconnectedPlayers){
                this.gameService.disconnectedPlayers = true;
                let playersNames = '';
                notActivePlayers.forEach((player:any) => {
                  const playerName = this.gameService.players.find((realPlayer:playerModel) => realPlayer.id === player.id)?.name;
                  playersNames = playersNames.concat(playerName + ', ');
                });
                this.gameService.textDialog({text: 'One or more players have left the game... waiting for ' + playersNames}, EventTypes.ONLINE_PLAYER_LEFT, true)
              }else if(!notActivePlayers.length && this.gameService.disconnectedPlayers){
                this.gameService.disconnectedPlayers = false;
                if(this.gameService.messageDialogRef){
                  this.gameService.closeDialog(this.gameService.messageDialogRef[this.gameService.messageDialogRef?.length - 1])
                }
              }
            }
            }))
        }))
      }
      return EMPTY;
    })).subscribe();
  }

  joinGame(){
    this.itsMyTurn();
    this.gameService.switchRouter('game');
  }

  startGame(){
    if(this.gameService.onlineGameStatus === onlineStatus.IN_LOBBY){
      this.gameService.setOnlineData$.next({path: '/online/gameStatus', value : onlineStatus.IN_GAME})
    }
    this.itsMyTurn();
    this.gameService.startGame();
    this.loadData()
  }

  handleMessages(message:any){
    console.log('message', message)
      switch (message.type) {
        case MessageTypes.CHANGE_TURN:
          this.gameService.turn = message.data.turn;
          this.gameService.setCameraOnPlayer(0);
          this.gameService.players[this.gameService.turn].canDice = true;
          this.gameService.diceNumber = undefined;
          this.itsMyTurn();
          this.gameService.textDialog({playerName: this.gameService.players[this.gameService.turn].name}, EventTypes.CHANGE_TURN, true);
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
          // if(!this.gameService.itsMyTurn){
          //   const player = this.gameService.players.find((player:playerModel) => player.id === message.data.playerId)
          //   this.gameService.addingRemovingMoney(message.data.type, message.data.amount, message.data.duration, player)
          // }
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
                // const cards = this.gameService.gameTable.cards.filter((card:cardModel) => message.data.cardsIds.includes(card.index));
                // this.gameService.openCompletedSeriesDialog(cards);
                break;
              case DialogTypes.EXCHANGE:
                this.gameService.openExchangeDialog();
                break;
              case DialogTypes.MESSAGE:
                this.gameService.textDialog(message.data.textData, message.data.eventType)
                break;
              case DialogTypes.DICE_RES:
                this.gamePhysicsService.diceRes = message.data.diceRes;
                this.gamePhysicsService.showRollResults();
                break;
              default:
                break;
            }
          }
          break;
        case MessageTypes.DIALOG_ACTION:
          if(!this.gameService.itsMyTurn){
            switch (message.data.dialogType) {
              case DialogTypes.CARD:
                this.gameService.cardDialogAction$.next({ type : message.data.actionType, data : message.data.value})
                break;
              case DialogTypes.COMPLETED_SERIES:
                this.gameService.cardDialogAction$.next({ type : message.data.actionType})
                break;
              case DialogTypes.EXCHANGE:
                this.gameService.exchangeDialogAction$.next(message.data)
                break;
              case DialogTypes.MESSAGE:
                this.gameService.messageDialogAction$.next({ type : message.data.actionType})
                break;
              case DialogTypes.DICE_RES:
                this.gameService.closeDialog(this.gameService.diceResDialogRef)
                break;
              default:
                break;
            }
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
