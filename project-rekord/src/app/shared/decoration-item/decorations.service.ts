import { Injectable } from '@angular/core';
import gsap from 'gsap'
import { GameService } from 'src/app/game.service';

@Injectable({
  providedIn: 'root'
})
export class DecorationsService {

  constructor(gameService: GameService) { }

  getDecorationLink(decorationType:string){
    return '../../../assets/blenderModels/decorations/' + decorationType + '.gltf';
  }

  scaleAnimation(elementRef:any){
    if(elementRef){
      gsap.fromTo(elementRef.scale, {x: elementRef.scale.x}, {x: 0.2, duration: 750/1000});
      gsap.fromTo(elementRef.scale, {z: elementRef.scale.z}, {z: 0.2, duration: 750/1000});
      setTimeout(() => {
        gsap.fromTo(elementRef.scale, {x: elementRef.scale.x}, {x: 1, duration: 750/1000});
        gsap.fromTo(elementRef.scale, {z: elementRef.scale.z}, {z: 1, duration: 750/1000});
      }, 750);
    }
  }

}
