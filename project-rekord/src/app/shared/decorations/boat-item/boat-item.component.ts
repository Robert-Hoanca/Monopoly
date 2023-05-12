import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import gsap from 'gsap'
import { GameService } from 'src/app/game.service';
import * as THREE from 'three';
import { DecorationsService } from '../../decoration-item/decorations.service';


@Component({
  selector: 'app-boat-item',
  templateUrl: './boat-item.component.html',
  styleUrls: ['./boat-item.component.scss']
})
export class BoatItemComponent implements OnInit {
  @ViewChild('boatRef', { static: true }) boatRef:any;
  @ViewChild('boatRefOutline', { static: true }) boatRefOutline:any;
  @Output() recalculateRandomNum: EventEmitter<any> = new EventEmitter();
  
  randomStartingPointX: number = Math.round((Math.random() * (50 + (0) + 1))) + 50;
  randomStartingPointZ: number = Math.round((Math.random() * (50 + (0) + 1))) + 50;
  rotationY:number = 0;
  randomscale:number = ((Math.random() * 0.8 ) + 0.5)

  randomAnimDuration: number =  Math.round((Math.random() * 20 ) + 15);
  
  randomTimeout: number = Math.round((Math.random() * (10 + (0) + 1)));

  direction:number = 0;
  axis:number = 0;

  particlesArray: Array<any> = [];

  constructor( public gameService: GameService, public decorationsService:DecorationsService) { }

  ngOnInit(): void {

  }

  ngAfterViewInit(){
    setTimeout(() => {
      setTimeout(() => {
        //this.recalculateRandomNum.emit();
        this.chooseStartingPoint();
      }, 100 * this.randomTimeout);

    }, 500);
  }

  chooseStartingPoint(){
    this.direction = (Math.round(Math.random()) ? 1 : -1); // If ( direction < 0 ) ==> Boat is going "DOWN"   else  boat is going "UP"
    this.axis = (Math.round(Math.random()) ? 1 : -1); // If ( axis > 0 ) ==> chosen axis in which the boat is goind ix "X"   else    chosen axis is "Z"

    //Based on chosen random direction and axis, get a random position higher than 50 for the chosen axis. Then choose the opposite axis position higher than 24 so the boat doesn't go throught the gameTable.
    if( this.direction < 0 ){
      if( this.axis > 0){
        this.rotationY = -Math.PI;
        this.moveGSAP(this.boatRef._objRef, 'y', this.rotationY , 0);
        this.moveGSAP(this.boatRef._objRef, 'x', (Math.round((Math.random() * (50 + (0) + 1))) + 50) , 0);
        this.moveGSAP(this.boatRef._objRef, 'z',  ((Math.round(Math.random()) ? 1 : -1) * (Math.round(Math.random() * (10 + (0) + 1)) + 24)) , 0);
      }else if( this.axis < 0){
        this.rotationY = Math.PI/2;
        this.moveGSAP(this.boatRef._objRef, 'y', this.rotationY , 0);
        this.moveGSAP(this.boatRef._objRef, 'z', (Math.round((Math.random() * (50 + (0) + 1))) + 50) , 0);
        this.moveGSAP(this.boatRef._objRef, 'x',  (Math.round(Math.random()) ? 1 : -1) * (Math.round(Math.random() * (20 + (0) + 1)) + 24) , 0);
      }
    }else if( this.direction > 0 ){
      if( this.axis > 0){        
        this.rotationY = 0;
        this.moveGSAP(this.boatRef._objRef, 'y', this.rotationY , 0);
        this.moveGSAP(this.boatRef._objRef, 'x', -(Math.round(Math.random() * (50 + (0) + 1)) + 50) , 0);
        this.moveGSAP(this.boatRef._objRef, 'z',  (Math.round(Math.random()) ? 1 : -1) * (-Math.round(Math.random() * (10 + (0) + 1))  -24) , 0);

      }else if( this.axis < 0){
        this.rotationY = -Math.PI/2;
        this.moveGSAP(this.boatRef._objRef, 'y', this.rotationY , 0);
        this.moveGSAP(this.boatRef._objRef, 'z', -(Math.round(Math.random() * (50 + (0) + 1)) + 50) , 0);
        this.moveGSAP(this.boatRef._objRef, 'x',  (Math.round(Math.random()) ? 1 : -1) * (-Math.round(Math.random() * (10 + (0) + 1))  -24) , 0);
      }
    }

    //Replay the boat animation choosing new random data.
    this.randomTimeout = Math.round((Math.random() * (10 + (0) + 1)));
    this.randomscale = (Math.random() * (0.5 - 0.2 + 0.5)) + 0.2;
    this.randomAnimDuration =  Math.round((Math.random() * 20 ) + 15);
    this.goToRandomPosition();
  }


  async goToRandomPosition(){

    const interval = setInterval(() => {
      const particle =  new THREE.Mesh(
        new THREE.BoxGeometry(0.2,0.01,0.2),
        new THREE.MeshBasicMaterial( {color: 0xffffff} )
      )
      particle.position.x = this.boatRef._objRef.position.x;
      particle.position.z = this.boatRef._objRef.position.z;
      particle.name = 'boat_particles';
      this.gameService.gameScene.add(particle);
      
      this.decorationsService.scaleAnimation(particle)

      setTimeout(() => {
        this.gameService.gameScene.remove(particle)
      }, 1500);

      this.particlesArray.push(particle);
    }, 500)


    //Based on direction and axis, make the boat travel until it reaches the opposite way.
    if(this.direction < 0){

      if(this.axis > 0){
        //x axis
        await this.moveGSAP(this.boatRef._objRef, 'x', -70 , this.randomAnimDuration, interval);
      }else if( this.axis < 0){
        //z axis
        await this.moveGSAP(this.boatRef._objRef, 'z', -70 , this.randomAnimDuration, interval);
      }
    }else if ( this.direction > 0){
      if(this.axis > 0){
        //x axis
        await this.moveGSAP(this.boatRef._objRef, 'x', 70 , this.randomAnimDuration, interval);
      }else if( this.axis < 0){
        //z axis
        await this.moveGSAP(this.boatRef._objRef, 'z', 70 , this.randomAnimDuration, interval);
      }
    }
    setTimeout(() => {
      this.chooseStartingPoint();
    }, 100 * this.randomTimeout);
  }

  async moveGSAP(element:any, axis:string , toPosition:number, duration:number, interval?:any){
    if(axis === 'x'){
      if(duration){
        await gsap.fromTo(element.position, {x: element.position.x}, {x: toPosition, duration: duration, onUpdate : (value:any) => {
          this.boatRefOutline._objRef.position.x = element.position.x;
          if(element.position.x == toPosition){
            clearInterval(interval);
          }
        }});
      }else{
        gsap.fromTo(element.position, {x: element.position.x}, {x: toPosition, duration: duration});
        gsap.fromTo(this.boatRefOutline._objRef.position, {x: this.boatRefOutline._objRef.position.x}, {x: toPosition, duration: duration});
      }
    }else if(axis=== 'z'){
      if(duration){
        await gsap.fromTo(element.position, {z: element.position.z}, {z: toPosition, duration: duration, onUpdate : (value:any) => {
          this.boatRefOutline._objRef.position.z = element.position.z;
          if(element.position.z == toPosition){
            clearInterval(interval);
          }
        }});
      }else{
        gsap.fromTo(element.position, {z: element.position.z}, {z: toPosition, duration: duration});
        gsap.fromTo(this.boatRefOutline._objRef.position, {z: this.boatRefOutline._objRef.position.z}, {z: toPosition, duration: duration});
      }
    }else if(axis === 'y'){
      gsap.fromTo(element.rotation, {y: element.rotation.y}, {y: toPosition, duration: duration});
      gsap.fromTo(this.boatRefOutline._objRef.rotation, {y: this.boatRefOutline._objRef.rotation.y}, {y: toPosition, duration: duration});
    }
  }

  setOutline(){
    this.gameService.gameScene.children.filter((child:any) => child.name.includes('boat_outline')).forEach((children:any) => {
      children.traverse((child:any) => {
        if(child.isMesh ){
          const material = new THREE.MeshBasicMaterial({color: 0x000000, side: THREE.BackSide});
          child.material = material
        }
      })
    });
  }

}
