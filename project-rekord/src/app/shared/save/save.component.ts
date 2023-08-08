import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/app/services/game.service';
import { OnlineService } from 'src/app/services/online.service';

@Component({
  selector: 'save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.scss']
})
export class SaveComponent implements OnInit {
  
  subscriptions$: Array<any> = [];

  constructor(public gameService : GameService, public onlineService : OnlineService) { }

  ngOnInit(): void {
    this.subscriptions$.push(this.gameService.setOnlineData$.subscribe(
      (data:any) => {
        if(this.gameService.amIOnline()) this.onlineService.setData(data.path, data.value)
      }
    ));

    console.log('init save component')
    //this.onlineService.clearAllDatabase()
  }

}
