import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as CANNON from 'cannon-es'
import * as THREE from 'three';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root'
})
export class GamePhysicsService {
  world = new CANNON.World({
    allowSleep: true,
  });
  time:number = 1 / 60;

  groundMesh:any;
  groundBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
  })
  diceArray:Array<any> = [];
  diceRes:Array<number> = [];

  dicesRolling:boolean = false;
  showDiceResultDialogRef: TemplateRef<any> | any;

  constructor(public gameService: GameService, private dialog: MatDialog) { }

  initWorld(){
    this.world.gravity.set(0, -9.82, 0);// m/s²
    this.world.defaultContactMaterial.restitution = .3;
    this.createGround()

    if(this.diceArray.length){
      this.diceArray.forEach(dice => {
        this.createDice(dice.body);
        this.addDiceEvents(dice)
      });
    }

  }

  createGround(){
    this.world.addBody(this.groundBody)
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0,0)
  }

  createDice(dice:any){
    this.world.addBody(dice.body);
    this.addDiceEvents(dice);
    this.diceRoll(dice)
  }

  renderPhysicsWorld(){
    this.world.step(this.time);

    this.groundMesh.position.copy(this.groundBody.position);
    this.groundMesh.quaternion.copy(this.groundBody.quaternion);

    this.renderDices()
  }

  renderDices(){
    this.diceArray.forEach(dice => {
      if(dice.mesh){
        dice.mesh.position.copy(dice.body.position);
        dice.mesh.quaternion.copy(dice.body.quaternion);
      }
    });
  }


  addDiceEvents(dice:any) {
    dice.body.addEventListener('sleep', (e:any) => {
        dice.body.allowSleep = false;
        const euler = new CANNON.Vec3();
        e.target.quaternion.toEuler(euler);

        const eps = .1;
        let isZero = (angle:any) => Math.abs(angle) < eps;
        let isHalfPi = (angle:any) => Math.abs(angle - .5 * Math.PI) < eps;
        let isMinusHalfPi = (angle:any) => Math.abs(.5 * Math.PI + angle) < eps;
        let isPiOrMinusPi = (angle:any) => (Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps);

        if (isZero(euler.z)) {
            if (isZero(euler.x)) {
                this.diceRes.push(1);
                this.showRollResults()
            } else if (isHalfPi(euler.x)) {
                this.diceRes.push(4);
                this.showRollResults()
            } else if (isMinusHalfPi(euler.x)) {
                this.diceRes.push(3);
                this.showRollResults()
            } else if (isPiOrMinusPi(euler.x)) {
                this.diceRes.push(6);
                this.showRollResults()
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.applyImpulse(
                  new CANNON.Vec3(0.5 , 0, 0.5),
                );
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
                this.diceRes.push(5);
                this.showRollResults()
        } else if (isMinusHalfPi(euler.z)) {
                this.diceRes.push(2);
                this.showRollResults()
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.applyImpulse(
              new CANNON.Vec3(0.5 , 0, 0.5),
            );
            dice.body.allowSleep = true;
        }
    });
  }


  
  diceRoll(dice:any){
    this.dicesRolling = true;
    dice.body.position.x = 10;
    dice.body.position.z = 10;
    dice.body.position.y = 10;

    dice.body.velocity.setZero();
    dice.body.angularVelocity.setZero();

    // set initial rotation
    dice.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random())
    dice.body.quaternion.copy(dice.mesh.quaternion);

    const force = 3 + 1 * Math.random();
    dice.body.applyImpulse(
      new CANNON.Vec3(force , 0, force),
      new CANNON.Vec3(0, 0.2 ,0 )
    );
    dice.body.allowSleep = true;
  }


  showRollResults(){
    if(this.diceRes.length === 2){
      this.openShowDiceResDialog(this.diceRes);
      setTimeout(() => {
        this.dialog.closeAll()
        if(!this.gameService.players[this.gameService.turn].prison.inPrison){
          if(this.diceRes[0]==this.diceRes[1]){
            this.gameService.players[this.gameService.turn].prison.doubleDiceCounter++;
            this.gameService.players[this.gameService.turn].canDice = true;
          }else{
            this.gameService.players[this.gameService.turn].prison.doubleDiceCounter=0;
            this.gameService.players[this.gameService.turn].canDice = false;
          }
          this.gameService.diceNumber =( (this.diceRes[0] + this.diceRes[1]) + this.gameService.players[this.gameService.turn].actualCard);
          if(this.gameService.diceNumber && this.gameService.diceNumber > (this.gameService.gameTable.cards.length - 1)){
            this.gameService.diceNumber = 0 + (((this.diceRes[0] + this.diceRes[1])-((this.gameService.gameTable.cards.length - 1) - this.gameService.players[this.gameService.turn].actualCard)) - 1);
          }
          this.gameService.getCardPosition(this.gameService.diceNumber);
        }else{
          if(this.diceRes[0] == this.diceRes[1]){
            this.gameService.exitFromPrison(false, true, this.diceRes[0], this.diceRes[1]);
            
          }else if(this.gameService.players[this.gameService.turn].prison.inPrisonTurnCounter == 2){
            this.gameService.exitFromPrison(true, false, this.diceRes[0], this.diceRes[1]);
          }else{
            this.gameService.players[this.gameService.turn].prison.inPrisonTurnCounter++;
            this.gameService.players[this.gameService.turn].canDice = false;
          }
        }
        this.dicesRolling = false
        this.diceRes = [];
      }, 2000);
    }
  }

  openShowDiceResDialog(diceRes:Array<number>){
    this.dialog.open(this.showDiceResultDialogRef, {
      panelClass: 'showDiceResult',
      hasBackdrop: true,
      autoFocus: false,
      disableClose:true,
      data: {
        diceRes: diceRes
      }
    });
  }

}


