import { Component, OnInit, ViewChild } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import gsap from 'gsap'
import { DecorationsService } from 'src/app/services/decorations.service';

@Component({
  selector: 'app-rain-drops-item',
  templateUrl: './rain-drops-item.component.html',
  styleUrls: ['./rain-drops-item.component.scss']
})
export class RainDropsItemComponent implements OnInit {

  @ViewChild('rainDropRef', { static: true }) rainDropRef:any;
  @ViewChild('rainSplashRef', { static: true }) rainSplashRef:any;
  randomStartingPointX: number = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
  randomStartingPointZ: number =  ((Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 - 0 + 1)) + 5));
  //randomStartingPointY: number =  Math.round((Math.random() * 30 ) + 20);

  randomTimeout: number =  Math.round((Math.random() * 20 ) + 1);
  rainDropOpacity:number = 1;
  rainSplashOpacity:number = 0;

  constructor(public gameService: GameService, public decorationsService:DecorationsService) { }

  ngOnInit(): void {
  }
  ngAfterViewInit(){
    this.moveGSAP(this.rainDropRef._objRef, Math.round((Math.random() * 120 ) + 100), 0)

    setTimeout(() => {
      this.rainDropAnimation();
    }, this.randomTimeout * 100);
    
  }

  async rainDropAnimation(){

    setInterval(async () => {
      this.randomStartingPointX = (Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 + (0) + 1)) + 5);
      this.randomStartingPointZ =  ((Math.round(Math.random()) ? 1 : -1) * ((Math.random() * (30 - 0 + 1)) + 5));
      this.randomTimeout =  Math.round((Math.random() * 5 ) + 0);
      this.rainDropOpacity = 1;
      await this.moveGSAP(this.rainDropRef._objRef, 0 , 2);
      this.moveGSAP(this.rainDropRef._objRef, Math.round((Math.random() * 120 ) + 100), 0)

    },3000)
  }

  async moveGSAP(element:any, toPosition:number, duration:number){
    if(duration){
      await gsap.fromTo(element.position, {y: element.position.y}, {y: toPosition, duration: duration, onComplete: ()=>{
        this.rainDropOpacity = 0;
        this.rainSplashOpacity = 1;

        this.decorationsService.scaleAnimation(this.rainSplashRef._objRef)
        setTimeout(() => {
          this.rainSplashOpacity = 0;
        }, 1500);
      } , onUpdate : (value:any) => {
        if(element.position.y < 20 && element.position.y > 10 && this.rainDropOpacity > 0.5){
          this.rainDropOpacity = 0.7;
        }else if(element.position.y < 10 && this.rainDropOpacity >= 0.5){
          this.rainDropOpacity = 0.5;
        } else if(element.position.y == 0){
        }

      }});
    }else{
      await gsap.fromTo(element.position, {y: element.position.y}, {y: toPosition, duration: duration});
    }
  }

}
