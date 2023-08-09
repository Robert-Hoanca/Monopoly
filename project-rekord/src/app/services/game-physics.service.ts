import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { debounceTime, fromEvent ,interval,take ,takeUntil,timer } from 'rxjs';
import { GameService } from './game.service';
import { SoundService } from './sound.service';
import gsap from 'gsap';
@Injectable({
  providedIn: 'root',
})
export class GamePhysicsService {
  world = new CANNON.World({
    allowSleep: true,
  });
  time: number = 1 / 60;

  groundArray: Array<any> = [];
  diceArray: Array<any> = [];
  diceRes: Array<number> = [];

  dicesRolling: boolean = false;
  showDiceResultDialogRef: TemplateRef<any> | any;

  gravity:number = -50;
  deltaTime:number = 0;
  lastTime:number = 0;

  constructor(public gameService: GameService, private dialog: MatDialog, public soundService : SoundService) {}

  initWorld() {
    this.world.gravity.set(0, this.gravity, 0); // -9.82 m/s²
    this.world.defaultContactMaterial.restitution = 0.3;
    this.createDiceCase();
  }

  createDiceCase() {
    //Bottom side
    this.createGround(20, 20, [11, 0, 11], [-Math.PI / 2, 0, 0]);
    //Z side
    this.createGround(20, 20, [11, 10, 1], [0, 0, 0]);
    this.createGround(20, 20, [11, 10, 21], [0, 0, 0]);
    //X side
    this.createGround(20, 20, [1, 10, 11], [0, -Math.PI / 2, 0]);
    this.createGround(20, 20, [21, 10, 11], [0, -Math.PI / 2, 0]);
  }

  createGround(
    width: number,
    heigth: number,
    position: any,
    rotation: Array<number>
  ) {
    const groundGeo = new THREE.PlaneGeometry(width, heigth);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      wireframe: false,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.gameService.gameScene.children.push(groundMesh);

    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(10, 10, 0.1)),
    });

    this.groundArray.push({
      mesh: groundMesh,
      body: groundBody,
    });

    this.world.addBody(groundBody);
    groundBody.position.x = position[0];
    groundBody.position.y = position[1];
    groundBody.position.z = position[2];
    groundBody.quaternion.setFromEuler(rotation[0], rotation[1], rotation[2]);
  }

  createDice(dice: any) {
    this.world.addBody(dice.body);
    if(!this.gameService.amIOnline() || (this.gameService.amIOnline() && this.gameService.itsMyTurn)){
      this.addDiceEvents(dice);
      this.diceRoll(dice);
    }
  }

  renderPhysicsWorld() {
    this.world.step(this.time);
    this.groundArray.forEach((groundEl) => {
      groundEl.mesh.position.copy(groundEl.body.position);
      groundEl.mesh.quaternion.copy(groundEl.body.quaternion);
    });
    this.renderDices();

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastTime) / 1000; // Converti in secondi
    this.lastTime = currentTime;
  }

  renderDices() {
    this.diceArray.forEach((dice) => {
      if (dice.mesh) {
        dice.mesh.position.copy(dice.body.position);
        dice.mesh.quaternion.copy(dice.body.quaternion);
      }
    });
  }

  addDiceEvents(dice: any) {

    fromEvent(dice.body, 'collide').pipe(debounceTime(65)).subscribe({
      next: (data) => {
        if (dice.body.velocity.length() > 2) {
          this.soundService.playDiceSound(dice);
        }
      }
    })

    fromEvent(dice.body, 'sleep')
      .pipe()
      .subscribe({
        next: (e: any) => {
          dice.body.allowSleep = false;
          const euler = new CANNON.Vec3();
          e.target.quaternion.toEuler(euler);

          const eps = 0.1;
          let isZero = (angle: any) => Math.abs(angle) < eps;
          let isHalfPi = (angle: any) => Math.abs(angle - 0.5 * Math.PI) < eps;
          let isMinusHalfPi = (angle: any) =>
            Math.abs(0.5 * Math.PI + angle) < eps;
          let isPiOrMinusPi = (angle: any) =>
            Math.abs(Math.PI - angle) < eps || Math.abs(Math.PI + angle) < eps;

          if (isZero(euler.z)) {
            if (isZero(euler.x)) {
              this.diceRes.push(1);
              this.showRollResults();
            } else if (isHalfPi(euler.x)) {
              this.diceRes.push(4);
              this.showRollResults();
            } else if (isMinusHalfPi(euler.x)) {
              this.diceRes.push(3);
              this.showRollResults();
            } else if (isPiOrMinusPi(euler.x)) {
              this.diceRes.push(6);
              this.showRollResults();
            } else {
              // landed on edge => wait to fall on side and fire the event again
              dice.body.applyImpulse(new CANNON.Vec3(1.5, 0, 1.5));
              dice.body.allowSleep = true;
            }
          } else if (isHalfPi(euler.z)) {
            this.diceRes.push(5);
            this.showRollResults();
          } else if (isMinusHalfPi(euler.z)) {
            this.diceRes.push(2);
            this.showRollResults();
          } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.applyImpulse(new CANNON.Vec3(1.5, 0, 1.5));
            dice.body.allowSleep = true;
          }
        },
      });
  }

  diceRoll(dice: any) {

    const initialRotation = {
      x : 2 * Math.PI * Math.random(),
      y : 0,
      z : 2 * Math.PI * Math.random()
    }
    const force = 3 * Math.random();

    
    if(this.gameService.amIOnline()){

      //Setting initial positions to each dice
      this.diceArray[dice.diceindex].startRotation = initialRotation;
      this.diceArray[dice.diceindex].startForce = force;
      //Sending dice initial positions to each client connected
      this.gameService.setOnlineData$.next({path: '/online/message/', value : {type : 'dice-roll', data : {
        startPosition : this.diceArray[dice.diceindex].startPosition,
        startRotation : initialRotation,
        startForce : force,
        diceI : dice.diceindex,
        startDeltaTime : this.deltaTime
      }}})
      return;
    }


    //Setting initial velocity
    dice.body.velocity.setZero();
    dice.body.angularVelocity.setZero();

    // set initial rotation
    dice.mesh.rotation.set(initialRotation.x, initialRotation.y, initialRotation.z);
    dice.body.quaternion.copy(dice.mesh.quaternion);


    
    // Applying random force
    const impulseForce = new CANNON.Vec3(force, 0, force);
    const impulsePosition = new CANNON.Vec3(0, 0.2, 0);
    impulseForce.scale(this.deltaTime, impulseForce); // Scale the force by deltaTime
    impulsePosition.scale(this.deltaTime, impulsePosition); // Scale the position by deltaTime


    //Applying random force
    dice.body.applyImpulse(
      impulseForce,
      impulsePosition
    );
    dice.body.allowSleep = true;
  }

  showRollResults() {
    if (this.diceRes.length === 2) {
      if (this.diceRes[0] == this.diceRes[1]) {
        this.gameService.players[this.gameService.turn].canDice = true;
        this.gameService.players[this.gameService.turn].prison
          .doubleDiceCounter++;
      } else {
        this.gameService.players[
          this.gameService.turn
        ].prison.doubleDiceCounter = 0;
        this.gameService.players[this.gameService.turn].canDice = false;
      }

      this.gameService.setCameraOnPlayer(1000);
      this.openShowDiceResDialog(this.diceRes);
    }
  }

  openShowDiceResDialog(diceRes: Array<number>) {
    this.dialog.open(this.showDiceResultDialogRef, {
      panelClass: 'showDiceResult',
      hasBackdrop: true,
      autoFocus: false,
      disableClose: true,
      data: {
        diceRes: diceRes,
      },
    });

    timer(2000)
      .pipe(
        take(1)
      )
      .subscribe({
        complete: () => {
          this.dialog.closeAll();
          this.doAfterRollingTheDice();
        },
      });
  }

  doAfterRollingTheDice() {
    if (!this.gameService.players[this.gameService.turn].prison.inPrison) {
      this.gameService.diceNumber =
        this.diceRes[0] +
        this.diceRes[1] +
        this.gameService.players[this.gameService.turn].actualCard;
      if (
        this.gameService.diceNumber &&
        this.gameService.diceNumber >
          this.gameService.gameTable.cards.length - 1
      ) {
        this.gameService.diceNumber =
          0 +
          (this.diceRes[0] +
            this.diceRes[1] -
            (this.gameService.gameTable.cards.length -
              1 -
              this.gameService.players[this.gameService.turn].actualCard) -
            1);
      }
      if (
        this.gameService.players[this.gameService.turn].prison
          .doubleDiceCounter === 3
      ) {
        this.gameService.whichPropertyAmI('goToPrison');
      } else {
        this.gameService.getCardPosition(this.gameService.diceNumber);
      }
    } else {
      if (this.diceRes[0] == this.diceRes[1]) {
        this.gameService.exitFromPrison(
          false,
          true,
          this.diceRes[0],
          this.diceRes[1]
        );
      } else if (
        this.gameService.players[this.gameService.turn].prison
          .inPrisonTurnCounter == 2
      ) {
        this.gameService.exitFromPrison(
          true,
          false,
          this.diceRes[0],
          this.diceRes[1]
        );
      } else {
        this.gameService.players[this.gameService.turn].prison
          .inPrisonTurnCounter++;
        this.gameService.players[this.gameService.turn].canDice = false;
      }
    }
    this.dicesRolling = false;
    this.gameService.diceRes = this.diceRes;
    this.diceRes = [];
  }

  reproduceDiceRoll (dice:any, index:number) {
    //Setting the position, rotation and force to the database data

    const diceBody = this.diceArray[index].body;
    const diceMesh = this.diceArray[index].mesh;
    
    diceBody.position.x = dice.startPosition.x;
    diceBody.position.y = dice.startPosition.y;
    diceBody.position.z = dice.startPosition.z;

    //Setting initial velocity
    diceBody.velocity.setZero();
    diceBody.angularVelocity.setZero();

    // set initial rotation
    diceMesh.rotation.set(dice.startRotation.x, dice.startRotation.y, dice.startRotation.z);
    diceBody.quaternion.copy(diceMesh.quaternion);


    // Applying random force
    const deltaTime = dice.startDeltaTime;
    const impulseForce = new CANNON.Vec3(dice.startForce, 0, dice.startForce);
    const impulsePosition = new CANNON.Vec3(0, 0.2, 0);
    impulseForce.scale(deltaTime, impulseForce); // Scale the force by deltaTime
    impulsePosition.scale(deltaTime, impulsePosition); // Scale the position by deltaTime
    
    

    //Applying random force
    diceBody.applyImpulse(
      impulseForce,
      impulsePosition
    );
    diceBody.allowSleep = true;
  }
}
