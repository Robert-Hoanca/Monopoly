import { Injectable } from '@angular/core';
import { SoundService } from './sound.service';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  settings:any = {
    sound: {
      enabledMusic: true,
      musicVolume : 0.1,
      enabledSfx:true,
      sfxVolume : 0.2,
    },
    godMode:false
  }
  constructor(private soundService : SoundService) { }

  retrieveSettings(){
    if(localStorage.getItem("rekord-options")){
      let localItem:any = localStorage.getItem("rekord-options")
      this.settings = JSON.parse(localItem);
    } else {
      this.saveSettings();
    }
  }

  updateSoundService(){
    if(this.settings && this.settings.sound){
      this.soundService.musicVolume = this.settings.sound.musicVolume;
      this.soundService.sfxVolume = this.settings.sound.sfxVolume;
      this.soundService.enableMusic = this.settings.sound.enabledMusic;
      this.soundService.enableSoundsEffects = this.settings.sound.enabledSfx;
    }
    this.saveSettings();
  }

  saveSettings(){
    localStorage.removeItem('rekord-options');
    localStorage.setItem('rekord-options',JSON.stringify(this.settings))
  }
}
