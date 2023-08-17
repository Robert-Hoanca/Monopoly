import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import * as THREE from 'three';
import gsap from 'gsap';
import { SoundService } from 'src/app/services/sound.service';
import { SoundTypes } from 'src/app/enums/soundTypes';
import { CardTypes } from 'src/app/enums/cardTypes';
import { cardModel } from 'src/app/models/card';
import { playerModel } from 'src/app/models/player';
@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent implements OnInit {
  @Input() player: any;
  @ViewChild('playerRef', { static: true }) public playerRef: any;
  @ViewChild('playerRefOutline', { static: true }) playerRefOutline: any;
  @ViewChild('cageRef', { static: true }) cageRef: any;
  finalPosition:Array<number> = [0,0,0];
  inCardPositionIndex:number = 0;
  inCardPosition:Array<number> = [0,0,0]
  finalRotation:Array<number> = [0,0,0];
  movingPlayerCell:number= 0;
  oldInCardIndex:number= 0;
  rotatedBack:boolean = false;
  playergoBack:boolean = false;
  playerArrived: boolean = false;
  gameTableSides: Array<string> = ['x', 'z', 'x', 'z'];
  playerInCage: boolean = false;
  cagePosition: [x: number, y: number, z: number] = [0, 0, 0];
  subscriptions$: Array<any> = [];

  constructor(public gameService: GameService, public soundService : SoundService) {}

  async ngOnInit() {
    this.subscriptions$.push(
      this.gameService.setPlayerPosition$.subscribe(async (data: any) => {
        if (this.playerArrived) {
          this.playerArrived = false;
        }
        if (this.player.id == this.gameService.players[this.gameService.turn].id) {
          this.calculateFinalPosition(data.cardPosition);
          if (
            this.gameService.randomChance &&
            this.gameService.randomChance.count != undefined &&
            this.gameService.randomChance.count < 0
          ) {
            //Only a chance can make the player go back
            this.playergoBack = true;
            this.setPlayerPosition(data.cardPosition,false,data.oldCardPosition,true);
          } else {
            this.setPlayerPosition(data.cardPosition,false,data.oldCardPosition);
          }
        }
      })
    );
    this.subscriptions$.push(
      this.gameService.shouldRemovePlayerCage$.subscribe((data: any) => {
        if (
          data.oldCardPosition !== undefined &&
          this.player.id === data.playerId
        ) {
          this.shouldRemovePrison(data.oldCardPosition);
        }
      })
    );
    this.subscriptions$.push(
      this.gameService.showHidePlayerInfo$.subscribe((data:any) => {
        if(this.player.id === data.playerId )
        this.showPlayerInfo(data.type)
      })
    )
  }

  //Calculate player's final position and save it without modifying the player's actual position.
  calculateFinalPosition(toGoPosition:Array<number>){

    //Calculate player final rotation when arriving.
    const side = this.whichSideAmI(this.player.actualCard);
    this.finalRotation = [0,this.calcPlayerRotation(side),0];
    
    //Calculate player position in the new card.
    const playerInTheSameCard = this.gameService.players.filter((player:playerModel) => player.id !== this.player.id && player.actualCard === this.player.actualCard);
    this.oldInCardIndex = this.player.pawn.cardSection;

    this.inCardPositionIndex = this.calculateNewCardSection(playerInTheSameCard)

    //this.inCardPositionIndex = playerInTheSameCard > 0 ? playerInTheSameCard : 0;

    //Calculate player final position
    this.finalPosition = JSON.parse(JSON.stringify(toGoPosition)); //Position to save in the storage
    this.calcPlayerPosInCard(this.inCardPositionIndex) //Position to use in game



    this.player.pawn.position = this.finalPosition;
    this.player.pawn.cardSection = this.inCardPositionIndex;
    this.player.pawn.rotation = this.finalRotation;
  }

  //Calculate player new cardSection based on other player's position.
  calculateNewCardSection(players:any){
    if(players.length === 0){
      return 0;
    }

    let knownIndexes:Array<number> = [];
    if(players.length){
      players.forEach((player:any) => {
        knownIndexes.push(player.pawn.cardSection)
      });

      if(!knownIndexes.includes(0)){
        return 0;
      }else if(!knownIndexes.includes(1)){
        return 1;
      }else if(!knownIndexes.includes(2)){
        return 2;
      }else if(!knownIndexes.includes(3)){
        return 3;
      }
    }
    return 0;
  }

  //Calculate in which side of the card the player should go based on its "cardSection" and in which side of the map it is.
  calcPlayerPosInCard(cardSection:number){
    const side = this.whichSideAmI(this.player.actualCard);
    const positionInCard = [0,0,0];
    switch (cardSection) {
      case 0:
        positionInCard[0] += (side === 'x+' || side === 'z-' ? 0.5 : -0.5);
        positionInCard[2] += (side === 'x+' || side === 'z+' ? 0.5 : -0.5);
        break;
      case 1:
        positionInCard[0] += (side === 'x+' || side === 'z+' ? 0.5 : -0.5);
        positionInCard[2] += (side === 'x-' || side === 'z+' ? 0.5 : -0.5);
        break;
      case 2:
        positionInCard[0] += (side === 'x-' || side === 'z+' ? 0.5 : -0.5);
        positionInCard[2] += (side === 'x-' || side === 'z-' ? 0.5 : -0.5);
        break;
      case 3:
        positionInCard[0] += (side === 'x-' || side === 'z-' ? 0.5 : -0.5);
        positionInCard[2] += (side === 'x+' || side === 'z-' ? 0.5 : -0.5);
        break;
    
      default:
        break;
    }
    this.inCardPosition = positionInCard;
  }

  //Calculate player's final rotation and save it without modifying the player's actual position.
  calcPlayerRotation(side:string){
    let rotation = 0;
    switch (side) {
      case 'x+':
        rotation = 0;
        break;
      case 'z+':
        rotation = -1.57;
        break;
      case 'x-':
        rotation = -3.14;
        break;
      case 'z-':
        rotation = -4.71;
        break;
    
      default:
        break;
    }
    return rotation;
  }

  //Return in which side the player is based on it's cell index.
  whichSideAmI(cardNumber:number){
    if(cardNumber >= 0 && cardNumber < 10){
      return 'x+';
    } else if(cardNumber >= 10 && cardNumber < 20){
      return 'z+';
    } else if(cardNumber >= 20 && cardNumber < 30){
      return 'x-';
    } else if(cardNumber >= 30 && cardNumber <= 39){
      return 'z-';
    }
    return '';
  }

  //Find if the player is on one of the four corner of the map based in it's actual cell.
  isPlayerOnCorner(position:number){
    return position === 0 || position === 10 || position === 20 || position === 30 ? true : false;
  }

  //Calculate player position based on where it has to go ( In which cell of the map has to move).
  async setPlayerPosition(position: any , noAnimation?: boolean , oldCardPosition?: number , goBack?: boolean ) {
    position = JSON.parse(JSON.stringify(position));
    let actualCardPosition = JSON.parse(JSON.stringify(this.gameService.players[this.gameService.turn].actualCard));

    if (noAnimation) {
      this.playerRef._objRef.position.x = position[0];
      this.playerRefOutline._objRef.position.x = position[0];
      this.playerRef._objRef.position.z = position[2];
      this.playerRefOutline._objRef.position.z = position[2];
      this.ShouldSpawnPrison(true);
    } else {
      if (oldCardPosition != undefined) {
        this.movingPlayerCell = oldCardPosition;
        let actualSide = 0;
        let toGoSide = 0;

        const newSide = this.whichSideAmI(actualCardPosition); //The side on which the player has to go.
        const oldSide = this.whichSideAmI(oldCardPosition); //The side on which the player is now.

        //Calculate both sides
        switch (newSide) {
          case 'x+':
            toGoSide = 0
            break;
          case 'z+':
            toGoSide = 1
            break;
          case 'x-':
            toGoSide = 2
            break;
          case 'z-':
            toGoSide = 3
            break;
        
          default:
            break;
        }
        switch (oldSide) {
          case 'x+':
            actualSide = 0
            break;
          case 'z+':
            actualSide = 1
            break;
          case 'x-':
            actualSide = 2
            break;
          case 'z-':
            actualSide = 3
            break;
        
          default:
            break;
        }

        //Player should go forward
        if (!goBack) {
          //Player should go on the same side as the starting side
          if (actualSide === toGoSide) {
             //Player should go on a cell after the actual position
            if (oldCardPosition < actualCardPosition) {
              await this.movePlayer(position, actualSide, oldCardPosition);
            } else { //Player should go on a cell before actual position
              if (actualSide === 3) {
                //If the player is on the last side has to go to the start
                await this.movePlayer([0, 0, 0], 3, oldCardPosition);
              } else {
                //Player is not on the last side just cycle the map to know where to go
                await this.cycleMap(actualSide, oldCardPosition, 3, 3, [0, 0, 0]);
              }
              actualSide = 0;
              //cycle the rest of the map to know where to go
              await this.cycleMap(actualSide,oldCardPosition,toGoSide,toGoSide,position);
            }
          } else if (actualSide < toGoSide) { //Player should go on a forward side, cycle the map to know where to go
            await this.cycleMap(
              actualSide,
              oldCardPosition,
              toGoSide,
              toGoSide,
              position
            );
          } else if (actualSide > toGoSide) { //Player should go on a side before the its current side ( Ex. from 2 to 0 )
            //If the player is on the last side has to go to the start
            if (actualSide === 3) {
              await this.movePlayer([0, 0, 0], 3, oldCardPosition);
            } else {
               //Player is not on the last side just cycle the map to know where to go
              await this.cycleMap(actualSide, oldCardPosition, 3, 3, [0, 0, 0]);
            }
            actualSide = 0;
            //cycle the rest of the map to know where to go
            await this.cycleMap(
              actualSide,
              oldCardPosition,
              toGoSide,
              toGoSide,
              position
            );
          }
        } else if (goBack) { //PLayer has to go back throught the cells
          if ((actualSide === toGoSide && oldCardPosition > actualCardPosition) || actualSide > toGoSide ) {//Player needs to go back and not pass throught the start
            await this.cycleMap(actualSide,oldCardPosition,toGoSide,toGoSide,position,true);
          } else if (actualSide < toGoSide ||(actualSide === toGoSide && oldCardPosition < actualCardPosition) ) { //Player needs to go back and passes from the start cell
            //Go from where am i to the start side.
            await this.cycleMap( actualSide, oldCardPosition, 0, 0,[0, 0, 0],true);
            //Set actualcard a 0
            actualSide = 3;
            //Dalla posizione 3 alla posizione in cui devo andare
            await this.cycleMap(actualSide,oldCardPosition,toGoSide, toGoSide,position,true );
          }
        }
        //When arrived on destination ask what to do in that cell.
        if(!this.gameService.amIOnline() || (this.gameService.amIOnline() && this.gameService.itsMyTurn)) this.gameService.whichPropertyAmI(this.gameService.gameTable.cards[this.gameService.players[this.gameService.turn].actualCard]);
      }
    }
  }

  //cycle the sides of the map in which the player has to pass to go from position A to position B. The make the player move throught every cell.
  async cycleMap( actualSide: number,oldCardPosition: number,indexCheckNum: number,indexMinusNum: number,finalPosition: Array<number>, goBack?: boolean) {
    if (!goBack) {
      for (let index = actualSide; index <= indexMinusNum; index++) {
        if (index < indexCheckNum) {
          await this.movePlayer([index == 0 || index == 1 ? 22 : 0,0,index == 1 || index == 2 ? 22 : 0,],index,oldCardPosition);
        } else {
          await this.movePlayer(finalPosition, index, oldCardPosition);
        }
      }
    } else if (goBack) {
      for (let index = actualSide; index >= indexMinusNum; index--) {
        if (index > indexCheckNum) {
          await this.movePlayer([index == 2 || index == 1 ? 22 : 0, 0,index == 2 || index == 3 ? 22 : 0,],index,oldCardPosition
          );
        } else {
          await this.movePlayer(finalPosition, index, oldCardPosition);
        }
      }
    }
  }

  //Based on the initial axis (x or y) cycle the cell where the player has to go and foreach cell play the animation. The player in the middle cold jump, rotate
  async movePlayer(position: any, index: number, oldCardPosition: number){

    let currentAxis = this.gameTableSides[index];

    //Player actual position
    let playerPos = parseFloat( JSON.parse(JSON.stringify(this.playerRef._objRef.position[currentAxis])).toFixed(1));
    
    //Calculate the amount of cards that the player should pass in
    let totOfCells = Math.round(Math.round(position[currentAxis === "x" ? 0 : 2]) != 22? (parseFloat(position[currentAxis === "x" ? 0 : 2].toFixed(1)) / 2.2) - (playerPos / 2.2) :( 22 / 2.2) - (playerPos / 2.2) );

    const goingBack = this.playergoBack; 
    let cellCounter = 0;

    if(totOfCells === 0 && !goingBack){
      return;
    }

    //If player is going back, rotate the player by 180deg accordingly to his actual side.
    if(goingBack && !this.rotatedBack){
      let side = this.whichSideAmI(oldCardPosition);
      switch (side) {
        case 'x+':
          this.rotatePlayer(oldCardPosition === 0 ? -1.57 : -3.14, true);
          break;
        case 'z+':
          this.rotatePlayer(-4.71, true);
            break;
        case 'x-':
          this.rotatePlayer(0, true);
          break;
        case 'z-':
          this.rotatePlayer(-1.57, true);
          break;
        default:
          break;
      }
      this.rotatedBack = true;
    }

    //Set player position to center
    if(this.movingPlayerCell === oldCardPosition && !this.gameService.movingPlayer){
      //Calculating and updating "playerPos" to match the center
      let isPositive = oldCardPosition < 20 ? true : false //Rappresent if the current axis ( x || z) is positive or negative ( x+ / x- || z+ / z-)
      let amountOfDistance = this.movePlayerToCenter(currentAxis, isPositive);
      playerPos += amountOfDistance;

      if(totOfCells === 0 && goingBack){
        this.playerMovingAnimation(currentAxis, playerPos, true) //Needed to fix position on start when turning back
      }
      this.gameService.movingPlayer = true;
    }

    for (totOfCells > 0 ? (cellCounter = 1) : (cellCounter = -1);totOfCells > 0? cellCounter <= Math.round(totOfCells) : cellCounter >= Math.round(totOfCells);totOfCells > 0 ? cellCounter++ : cellCounter--) {
      //Making the camera follow the player with an offset
      let totOfCellsPositive = totOfCells > 0;
      if(currentAxis === 'x'){
        this.gameService.setCameraPosition(
          [this.gameService.camera._objRef.position.x + (totOfCellsPositive ? 1 : -1) , 10, this.gameService.camera._objRef.position.z + (totOfCellsPositive ? -1 : 1)],
          [this.gameService.cameraControls._objRef.target.x + (totOfCellsPositive ? 1 : -1),0,this.gameService.cameraControls._objRef.target.z + (totOfCellsPositive ? -1 : 1)],
          500)
      } else if(currentAxis === 'z'){
        this.gameService.setCameraPosition(
          [this.gameService.camera._objRef.position.x + (totOfCellsPositive ? -1 : 1) , 10, this.gameService.camera._objRef.position.z + (totOfCellsPositive ? 1 : -1)],
          [this.gameService.cameraControls._objRef.target.x + (totOfCellsPositive ? -1 : 1),0,this.gameService.cameraControls._objRef.target.z + (totOfCellsPositive ? 1 : -1)],
          500)
      }
      
      await gsap.fromTo(this.playerRef._objRef.position,{ [currentAxis]: this.playerRef._objRef.position[currentAxis] }, {[currentAxis]: playerPos + parseFloat((cellCounter * 2.2).toFixed(1)) ,duration: 0.5,ease: 'ease-out', 
        onStart : () =>{
          //Jump up
          this.playerJump(true);
          //Return down
          setTimeout(() => {
            this.playerJump(false);
          }, 200);
        },
        
        onComplete: () => {
          //Update cell counter
          if(this.movingPlayerCell === 39 && !goingBack){
            this.movingPlayerCell = 0
          }else if(this.movingPlayerCell === 0 && goingBack){
            this.movingPlayerCell = 39;
          }else if(!goingBack){
            this.movingPlayerCell++;
          } else {
            this.movingPlayerCell--;
          }

          //Check if player has reached one angle of the gameTable, if so rotate the player accordingly.
          if(this.isPlayerOnCorner(this.movingPlayerCell)){
            switch (this.movingPlayerCell) {
              case 0:
                this.rotatePlayer(goingBack ? -1.57 : 0, true);
                break;
              case 10:
                this.rotatePlayer(goingBack ? -3.14 : -1.57, true);
                break;
              case 20:
                this.rotatePlayer(goingBack ? -4.71 : -3.14, true);
                  break;
              case 30:
                this.rotatePlayer(goingBack ? 0 : -4.71, true);
                break;
              default:
                break;
            }
          }

          //Player has arrived to it's destination.
          if(this.movingPlayerCell === this.player.actualCard){
            //If the player was walking back, set its rotation to normal when arriving.
            if(goingBack && this.rotatedBack){
              let side = this.whichSideAmI(this.movingPlayerCell);
              switch (side) {
                case 'x+':
                  this.rotatePlayer(0, true);
                  break;
                case 'z+':
                  this.rotatePlayer(-1.57, true);
                    break;
                case 'x-':
                  this.rotatePlayer(-3.14, true);
                  break;
                case 'z-':
                  this.rotatePlayer(-4.71, true);
                  break;
                default:
                  break;
              }
              this.rotatedBack = false;
            }
            if(this.player.prison.inPrison){
              this.ShouldSpawnPrison(true);
            }
            this.gameService.movingPlayer = false;
            this.gameService.disabledUserHoveringCard = false;
            this.playergoBack = false;
            this.gameService.resetChestChance();
            //Move player on it's side of the card when arriving.
            this.playerMovingAnimation('x', this.player.pawn.position[0] + this.inCardPosition[0], false);
            this.playerMovingAnimation('z', this.player.pawn.position[2] + this.inCardPosition[2], false);
            //Change card border color to normal when player arrived.
            this.gameService.changeCardBorderColor$.next({type: 'playerArrivedReturnToNormal', color: this.gameService.sessionTheme.cardBorder});
          }

          //Check if player is in the "start" cell, if so add money.
          if(this.movingPlayerCell === 0){
            this.gameService.playerPassedStart();
          }
        },
        onUpdate: () => {
          //Update player outline position
          this.playerRefOutline._objRef.position[currentAxis] =this.playerRef._objRef.position[currentAxis];
        }  
        }
      );
    }


  }

  //Move the player from being on one side of a cell to the center of it.
  movePlayerToCenter(axis:string, isPositive:boolean){
    if (axis === 'x') {
      switch (this.oldInCardIndex) {
        case 0:
          this.playerMovingAnimation('z', isPositive ? this.playerRef._objRef.position.z - 0.5 : this.playerRef._objRef.position.z + 0.5, false);
          return isPositive ? -0.5 : 0.5;
        case 1:
          this.playerMovingAnimation('z', isPositive ? this.playerRef._objRef.position.z + 0.5 : this.playerRef._objRef.position.z - 0.5, false);
          return isPositive ? -0.5 : 0.5;
        case 2:
          this.playerMovingAnimation('z', isPositive ? this.playerRef._objRef.position.z + 0.5 : this.playerRef._objRef.position.z - 0.5, false);
          return isPositive ? 0.5 : -0.5;
        case 3:
          this.playerMovingAnimation('z', isPositive ? this.playerRef._objRef.position.z - 0.5 : this.playerRef._objRef.position.z + 0.5, false);
          return isPositive ? 0.5 : -0.5;
        default:
          return 0;
      }
    } else if (axis === 'z') {
      switch (this.oldInCardIndex) {
        case 0:
          this.playerMovingAnimation('x', isPositive ? this.playerRef._objRef.position.x + 0.5 : this.playerRef._objRef.position.x - 0.5, false);
          return isPositive ? -0.5 : 0.5;
        case 1:
          this.playerMovingAnimation('x', isPositive ? this.playerRef._objRef.position.x - 0.5 : this.playerRef._objRef.position.x + 0.5, false);
          return isPositive ? -0.5 : 0.5;
        case 2:
          this.playerMovingAnimation('x', isPositive ? this.playerRef._objRef.position.x - 0.5 : this.playerRef._objRef.position.x + 0.5, false);
          return isPositive ? 0.5 : -0.5;
        case 3:
          this.playerMovingAnimation('x', isPositive ? this.playerRef._objRef.position.x + 0.5 : this.playerRef._objRef.position.x - 0.5, false);
          return isPositive ? 0.5 : -0.5;
        default:
          return 0;
      }
    } else {
      return 0;
    }
  }

  //Play the moving animation for the player.
  async playerMovingAnimation(side:string, value:number, wait:boolean){
    //Side can be x || z.
    if(wait){
      await gsap.fromTo(
        this.playerRef._objRef.position,
        { [side] : this.playerRef._objRef.position[side] },
        { [side] : value ,ease: 'ease-out', duration : 0.5,
          onUpdate: () => {
            this.playerRefOutline._objRef.position[side] = this.playerRef._objRef.position[side];
          },
        }
      );
    } else{
      gsap.fromTo(
        this.playerRef._objRef.position,
        { [side] : this.playerRef._objRef.position[side] },
        { [side] : value, ease: 'ease-out', duration : 0.5,
          onUpdate: () => {
            this.playerRefOutline._objRef.position[side] = this.playerRef._objRef.position[side];
          },
        }
      );
    }
  }

  async rotatePlayer(value: number, animation: boolean) {
    if (animation) {
      await gsap.fromTo(
        this.playerRef._objRef.rotation,
        { y: this.playerRef._objRef.rotation.y },
        {
          y: value,
          duration: 0.3,
          onUpdate: () => {
            this.playerRefOutline._objRef.rotation.y = this.playerRef._objRef.rotation.y;
          },
        }
      );
    } else {
      this.playerRef._objRef.rotation.y = value;
      this.playerRefOutline._objRef.rotation.y = value;
    }
  }

  playerJump(shouldJump: boolean) {
    gsap.fromTo(
      this.playerRef._objRef.position,
      { y: this.playerRef._objRef.position.y },
      {
        y: shouldJump ? 0.5 : 0,
        ease: 'ease-out',
        duration: 0.20,
        onUpdate: () => {
          this.playerRefOutline._objRef.position.y = this.playerRef._objRef.position.y;
        },
        onComplete : () =>{
          if(!shouldJump){
            this.soundService.playSound(SoundTypes.PAWN_MOVE);
          }
        }
      }
    );
  }

  //Set player outline
  setOutline() {
    this.gameService.gameScene.children
      .filter((child: any) => child.name.includes('player_outline'))
      .forEach((children: any) => {
        children.traverse((child: any) => {
          if (child.isMesh) {
            const material = new THREE.MeshBasicMaterial({
              color: 0x000000,
              side: THREE.BackSide,
            });
            child.material = material;
          }
        });
      });
  }

  ShouldSpawnPrison(force:boolean) {
    const playerCardIndex = this.player.actualCard;
    
    const prisonCardIndex = this.gameService.gameTable.cards.findIndex(
      (card: cardModel) => card.cardType === CardTypes.PRISON
    );

    if (
      prisonCardIndex != -1 &&
      playerCardIndex === prisonCardIndex &&
      this.player.prison.inPrison &&
       (this.playerArrived || force)
    ) {
      this.playerInCage = true;
      this.cagePosition = [
        this.player.pawn.position[0] + (this.inCardPosition[0]),
        2,
        this.player.pawn.position[2] + (this.inCardPosition[2]),
      ];
      this.spawnCage(this.cageRef._objRef, 500);
    } else {
      this.playerInCage = false;
    }
  }

  shouldRemovePrison(startingCardIndex: number) {
    const prisonCardIndex = this.gameService.gameTable.cards.findIndex(
      (card: cardModel) => card.cardType === CardTypes.PRISON
    );

    if (
      prisonCardIndex != -1 &&
      startingCardIndex === prisonCardIndex &&
      this.playerInCage
    ) {
      this.playerInCage = false;
      this.deleteCage(this.cageRef._objRef, 500);
    }
  }

  spawnCage(elementRef: any, duration: number) {
    if (elementRef) {
      gsap.fromTo(
        elementRef.scale,
        { x: elementRef.scale.x },
        { x: 1.2, duration: duration / 1000 }
      );
      gsap.fromTo(
        elementRef.scale,
        { y: elementRef.scale.y },
        { y: 1.2, duration: duration / 1000 }
      );
      gsap.fromTo(
        elementRef.scale,
        { z: elementRef.scale.z },
        { z: 1.2, duration: duration / 1000 }
      );

      setTimeout(() => {
        gsap.fromTo(
          elementRef.position,
          { y: elementRef.position.y },
          { y: 0, duration: duration / 1000 }
        );
      }, duration);
    }
  }

  deleteCage(elementRef: any, duration: number) {
    if (elementRef) {
      gsap.fromTo(
        elementRef.position,
        { y: elementRef.position.y },
        { y: 2, duration: duration / 1000 }
      );

      setTimeout(() => {
        gsap.fromTo(
          elementRef.scale,
          { x: elementRef.scale.x },
          { x: 0, duration: duration / 1000 }
        );
        gsap.fromTo(
          elementRef.scale,
          { y: elementRef.scale.y },
          { y: 0, duration: duration / 1000 }
        );
        gsap.fromTo(
          elementRef.scale,
          { z: elementRef.scale.z },
          { z: 0, duration: duration / 1000 }
        );
      }, duration);
    }
  }

  showPlayerInfo(type:string){
    if(this.playerRef._objRef){
      if(type === 'show' && !this.gameService.playerShowingInfo.includes(this.player.id)){
        this.gameService.playerShowingInfo.push(this.player.id);
        this.setPlayerCardPosition()
      }
      else if(type === 'hide' && this.gameService.playerShowingInfo.includes(this.player.id)){
        const idIndex = this.gameService.playerShowingInfo.findIndex(playerId => playerId === this.player.id);
        this.gameService.playerShowingInfo.splice(idIndex,1)
        this.setPlayerCardPosition()
      }
      else if(type === 'onlySetPosition'){
        this.setPlayerCardPosition()
      }
    }
  }

  setPlayerCardPosition(){
    const playerIndex = this.gameService.players.findIndex((player:playerModel) => player.id === this.player.id)
    const infoEl = document.querySelectorAll<HTMLElement>('.playerCard[player-id="' + this.player.name + playerIndex + '"]')[0];
    const position = this.gameService.getObjectScreenPosition(this.playerRef);
    //Aggiungere sistema che controlla se due o piu' info si sovrappongono
      if(infoEl){

        if((position[0] - ((infoEl.clientHeight + 20))) < 0){ //Player top position  - card height + offset will go off the screen on the top
          infoEl.style.top = (position[0] + 10) + 'px';
        }else{
          infoEl.style.top = (position[0] - ((infoEl.clientHeight + 20))) + 'px';
        }

          
        if((position[1] - (infoEl.clientWidth / 2)) < 0){ //Player left position  - half card width will go off the screen on the left
          infoEl.style.left = position[1] + 'px';
        } else if(( position[1] + (infoEl.clientWidth)) > window.innerWidth){ //Player Left position  + card full width will go off the screen on the right
          infoEl.style.left = (position[1] -  infoEl.clientWidth) + 'px';
        }else {
          infoEl.style.left = (position[1] - (infoEl.clientWidth / 2)) + 'px' ;
        }

      }

    if(this.gameService.playerShowingInfo.includes(this.player.id) && position[0] > 0 && position[1] > 0)
      infoEl.classList.add('show'); 
    else 
      infoEl.classList.remove('show');
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
