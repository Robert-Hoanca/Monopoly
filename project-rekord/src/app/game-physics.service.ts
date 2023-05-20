import { Injectable, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { GameService } from './game.service';
import { EMPTY, Observable, fromEvent, switchMap, take, tap, timer } from 'rxjs';

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

  constructor(public gameService: GameService, private dialog: MatDialog) {}

  initWorld() {
    this.world.gravity.set(0, -20, 0); // -9.82 m/s²
    this.world.defaultContactMaterial.restitution = 0.3;
    this.createDiceCase();
    if (this.diceArray.length) {
      this.diceArray.forEach((dice) => {
        this.createDice(dice.body);
        this.addDiceEvents(dice);
      });
    }
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
    this.addDiceEvents(dice);
    this.diceRoll(dice);
  }

  renderPhysicsWorld() {
    this.world.step(this.time);
    this.groundArray.forEach((groundEl) => {
      groundEl.mesh.position.copy(groundEl.body.position);
      groundEl.mesh.quaternion.copy(groundEl.body.quaternion);
    });
    this.renderDices();
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
    this.dicesRolling = true;
    dice.body.position.x = Math.round(Math.random() * 9 + 7);
    dice.body.position.z = Math.round(Math.random() * 10 + 7);
    dice.body.position.y = Math.round(Math.random() * 9 + 7);

    dice.body.velocity.setZero();
    dice.body.angularVelocity.setZero();

    // set initial rotation
    dice.mesh.rotation.set(
      2 * Math.PI * Math.random(),
      0,
      2 * Math.PI * Math.random()
    );
    dice.body.quaternion.copy(dice.mesh.quaternion);

    const force = 3 + 0 * Math.random();
    dice.body.applyImpulse(
      new CANNON.Vec3(force, 0, force),
      new CANNON.Vec3(0, 0.2, 0)
    );
    dice.body.allowSleep = true;
  }

  showRollResults() {
    if (this.diceRes.length === 2) {
      this.diceRes = [2,2]
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
}
