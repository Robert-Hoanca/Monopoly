import { Component, Input, OnInit, ViewChild } from '@angular/core';
import * as CANNON from 'cannon-es'
import gsap from 'gsap';
import { GamePhysicsService } from 'src/app/services/game-physics.service';
@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent implements OnInit {
  @ViewChild('diceRef', { static: true }) diceRef:any;
  @Input() diceIndex!: any;

  diceMesh:any;
  diceBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
    sleepTimeLimit: 0.1 ,
  })

  positionX = 0;
  positionY = 0;
  positionZ = 0;

  constructor(public gamePhysicsService : GamePhysicsService) { }

  ngOnInit(): void {
    this.positionX = Math.round(Math.random() * 9 + 7);
    this.positionY = Math.round(Math.random() * 15 + 10);
    this.positionZ = Math.round(Math.random() * 9 + 7);

    this.diceBody.position.x = this.positionX;
    this.diceBody.position.z = this.positionZ;
    this.diceBody.position.y = this.positionY;
  }

  ngAfterViewInit(){
  }

  setDicePhysics(){
    this.diceMesh = this.diceRef._objRef;
    this.gamePhysicsService.diceArray.push({
      mesh: this.diceMesh,
      body: this.diceBody
    })


    this.gamePhysicsService.createDice({
      mesh: this.diceMesh,
      body: this.diceBody,
      diceindex: this.diceIndex
    })
  }

  diceScaleAnimation(){

    if(this.diceRef){

      gsap.fromTo(
        this.diceRef._objRef.scale,
        { x: this.diceRef._objRef.scale.x },
        { x: 0.5, duration: 0.20, onComplete: () =>{
          this.setDicePhysics()
        }}
      );
      gsap.fromTo(
        this.diceRef._objRef.scale, 
        { y: this.diceRef._objRef.scale.y },
        { y: 0.5, duration: 0.20 }
      );
      gsap.fromTo(
        this.diceRef._objRef.scale,
        { z: this.diceRef._objRef.scale.z },
        { z: 0.5, duration: 0.20 }
      );

    }
  }


  ngOnDestroy(){
    this.gamePhysicsService.diceArray.pop()
  }
}
