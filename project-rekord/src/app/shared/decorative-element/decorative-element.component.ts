import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-decorative-element',
  templateUrl: './decorative-element.component.html',
  styleUrls: ['./decorative-element.component.scss']
})
export class DecorativeElementComponent implements OnInit {
  @Input() url!: any;
  @Input() position!: any;
  @Input() rotation!: any;

  constructor() { }

  ngOnInit(): void {
  }

}
