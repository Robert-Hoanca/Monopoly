import { Injectable } from '@angular/core';
import gsap from 'gsap'

@Injectable({
  providedIn: 'root'
})
export class DecorationsService {

  constructor() { }

  getDecorationLink(decorationType:string){
    return '../../../assets/blenderModels/decorations/' + decorationType + '.gltf';
  }

  scaleAnimation(elementRef:any){
    if(elementRef){
      gsap.fromTo(elementRef._objRef.scale, {x: elementRef._objRef.scale.x}, {x: 0.2, duration: 750/1000});
      gsap.fromTo(elementRef._objRef.scale, {z: elementRef._objRef.scale.z}, {z: 0.2, duration: 750/1000});
      setTimeout(() => {
        gsap.fromTo(elementRef._objRef.scale, {x: elementRef._objRef.scale.x}, {x: 1, duration: 750/1000});
        gsap.fromTo(elementRef._objRef.scale, {z: elementRef._objRef.scale.z}, {z: 1, duration: 750/1000});
      }, 750);
    }
  }

}
