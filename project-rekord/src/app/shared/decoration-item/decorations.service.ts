import { Injectable } from '@angular/core';
import gsap from 'gsap'
import { GameService } from 'src/app/game.service';

@Injectable({
  providedIn: 'root'
})
export class DecorationsService {

  decorations:Array<object> = [{ label: 'water_wave', type: 'water', notCompatibleType : 'ground'}, { label: 'boat', type: 'water', notCompatibleType : 'ground'}, { label: 'rain', type: 'air', notCompatibleType : 'none'}, { label: 'cloud', type: 'air', notCompatibleType : 'none'}, { label: 'grass', type: 'ground' , notCompatibleType : 'water'}, { label: 'grain', type: 'filter' , notCompatibleType : 'none'}];
  randomChosenDecorations:Array<object> = [];
  howManyDecorations:number = 2;

  constructor(gameService: GameService) { }

  chooseDecorations(){
    this.randomChosenDecorations = [];
    let decoration1:any = this.decorations[Math.round((Math.random() * (this.decorations.length - 1)) + 0)];
    let decoration2:any = this.decorations[Math.round((Math.random() * (this.decorations.length - 1)) + 0)]

    if(decoration1.type.includes(decoration2.notCompatibleType) || decoration1.type.includes(decoration2.type)){
      while(decoration1.type.includes(decoration2.notCompatibleType) || decoration1.type.includes(decoration2.type)){
        decoration2 = this.decorations[Math.round((Math.random() * (this.decorations.length - 1)) + 0)]
      }
    }
    this.randomChosenDecorations.push(decoration1, decoration2)
  }

  decorationIsIncluded(type:string){
    return this.randomChosenDecorations.find((decoration:any) => decoration.label === type) ? true : false;
  }

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
