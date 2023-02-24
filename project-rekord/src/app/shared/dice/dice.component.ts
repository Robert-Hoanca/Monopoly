import { Component, OnInit, ViewChild } from '@angular/core';
import * as CANNON from 'cannon-es'
import { GamePhysicsService } from 'src/app/game-physics.service';
@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.scss']
})
export class DiceComponent implements OnInit {
  @ViewChild('diceRef', { static: true }) diceRef:any;

  diceMesh:any;
  diceBody = new CANNON.Body({
    mass: 10,
    shape: new CANNON.Box(new CANNON.Vec3(1,1,1)),
    sleepTimeLimit: 0.1 ,
  })


  constructor(public gamePhysicsService : GamePhysicsService) { }

  ngOnInit(): void {
    this.diceMesh = this.diceRef._objRef;
    this.gamePhysicsService.diceArray.push({
      mesh: this.diceMesh,
      body: this.diceBody
    })
    //this.gamePhysicsService.createDice(this.diceBody)
  }

}
