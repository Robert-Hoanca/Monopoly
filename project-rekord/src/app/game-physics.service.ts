import { Injectable } from '@angular/core';
import * as CANNON from 'cannon-es'
import * as THREE from 'three';

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

  constructor() { }

  initWorld(){
    this.world.gravity.set(0, -9.82, 0);// m/s²
    this.world.defaultContactMaterial.restitution = .3;
    this.createGround()

    this.diceArray.forEach(dice => {
      this.createDice(dice.body);
      this.addDiceEvents(dice)
    });

  }

  createGround(){
    this.world.addBody(this.groundBody)
    this.groundBody.quaternion.setFromEuler(-Math.PI / 2, 0,0)
  }

  createDice(diceBody:any){
    diceBody.position.set(0,10,0);
    this.world.addBody(diceBody);
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
        console.log("log: ", e)
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
                this.showRollResults(1);
            } else if (isHalfPi(euler.x)) {
              this.showRollResults(4);
            } else if (isMinusHalfPi(euler.x)) {
              this.showRollResults(3);
            } else if (isPiOrMinusPi(euler.x)) {
              this.showRollResults(6);
            } else {
                // landed on edge => wait to fall on side and fire the event again
                dice.body.allowSleep = true;
            }
        } else if (isHalfPi(euler.z)) {
          this.showRollResults(5);
        } else if (isMinusHalfPi(euler.z)) {
          this.showRollResults(2);
        } else {
            // landed on edge => wait to fall on side and fire the event again
            dice.body.allowSleep = true;
        }
    });
  }


  
  diceRollTest(dice:any){
    dice.body.position.x = 0;
    dice.body.position.z = 0;
    dice.body.position.y = 10;

    dice.body.velocity.setZero();
    dice.body.angularVelocity.setZero();

    // set initial rotation
    dice.mesh.rotation.set(2 * Math.PI * Math.random(), 0, 2 * Math.PI * Math.random())
    dice.body.quaternion.copy(dice.mesh.quaternion);

    const force = 3 + 5 * Math.random();
    dice.body.applyImpulse(
      new CANNON.Vec3(force , 0, force),
      new CANNON.Vec3(0, 0.2 ,0 )
    );
    dice.body.allowSleep = true;
  }


  showRollResults(result:number){
    console.log("result", result)
  }

}


