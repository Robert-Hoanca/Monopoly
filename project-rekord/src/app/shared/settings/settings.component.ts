import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SettingsService } from 'src/app/settings.service';
import { SoundService } from 'src/app/sound.service';

@Component({
  selector: 'settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Input() whereAmI!: string;
  @Output() close: EventEmitter<any> = new EventEmitter();

  constructor(public settingsService : SettingsService, public soundService : SoundService) { }

  ngOnInit(): void {
    
  }

  saveSettings(){
    this.close.emit();
    this.settingsService.saveSettings();
  }

}
