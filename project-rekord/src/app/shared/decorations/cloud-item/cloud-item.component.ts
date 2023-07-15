import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import gsap from 'gsap'

@Component({
  selector: 'app-cloud-item',
  templateUrl: './cloud-item.component.html',
  styleUrls: ['./cloud-item.component.scss']
})
export class CloudItemComponent implements OnInit {
  @ViewChild('cloudRef', { static: true }) cloudRef:any;
  @Output() recalculateRandomNum: EventEmitter<any> = new EventEmitter();
  //Cloud
  randomCloudWidthX: number = (Math.random() * (5 - 1 + 1)) + 1;
  randomCloudWidthZ: number = (Math.random() * (5 - 1 + 1)) + 1;
  randomCloudHeigthY: number = (Math.random() * (0.5 - 0.2)) + 1;

  randomStartingPointX: number = (Math.round(Math.random()) ? 1 : -1) *  Math.round((Math.random() * 30 )+ 1);
  randomStartingPointZ: number =  100 + Math.round((Math.random() * 50 )+ 1);

  randomCloudHeightPos: number = Math.round((Math.random() * 5 ) + 2);

  cloudAnimationDuration: number = 20000;
  cloudOpacity:number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.moveCloudAnimation(this.cloudRef);
    setInterval(() => {
      this.recalculateRandomNum.emit();
      this.cloudOpacity = 1;
      this.moveCloudAnimation(this.cloudRef);
    }, (this.cloudAnimationDuration) + 50)
  }

  moveCloudAnimation(elementRef:any){
    this.cloudOpacity = (Math.random() * (1 - 0)) + 0.2;
    gsap.fromTo(elementRef._objRef.position, {z: 100}, {z: -70, duration:this.cloudAnimationDuration/1000, onComplete: () =>{
      this.cloudOpacity = 0;
      const newXPosition = (Math.round(Math.random()) ? 1 : -1) * (Math.random() * (30 + (0) + 1)) + 1;
      const newZPosition = (100 + ((Math.round(Math.random()) ? 1 : -1) * (Math.random() * (30 - 0 + 1)) + 1))
      gsap.fromTo(elementRef._objRef.position, {x: elementRef._objRef.position.x}, {x: newXPosition, duration:0});
      gsap.fromTo(elementRef._objRef.position, {z: elementRef._objRef.position.z}, {z: newZPosition, duration:0});
    }});
  }

}
