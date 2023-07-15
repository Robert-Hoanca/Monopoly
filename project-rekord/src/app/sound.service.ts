import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
import { SettingsService } from './settings.service';
@Injectable({
  providedIn: 'root'
})
export class SoundService {

  enableMusic:boolean = true;
  enableSoundsEffects:boolean = true;

  musicVolume:number = 0.1;
  sfxVolume:number = 0.2;

  diceSounds = [
    new Audio('../assets/sound/dice/dice_1.mp3'),
    new Audio('../assets/sound/dice/dice_2.mp3'),
    new Audio('../assets/sound/dice/dice_3.mp3'),
    new Audio('../assets/sound/dice/dice_4.mp3'),
    new Audio('../assets/sound/dice/dice_5.mp3'),
    new Audio('../assets/sound/dice/dice_6.mp3'),
    new Audio('../assets/sound/dice/dice_7.mp3'),
    new Audio('../assets/sound/dice/dice_8.mp3'),
    new Audio('../assets/sound/dice/dice_9.mp3'),
    new Audio('../assets/sound/dice/dice_10.mp3'),
    new Audio('../assets/sound/dice/dice_11.mp3'),
  ];

  pawnSounds = [
    new Audio('../assets/sound/pawn/pawn_1.mp3'),
    new Audio('../assets/sound/pawn/pawn_2.mp3'),
    new Audio('../assets/sound/pawn/pawn_3.mp3'),
    new Audio('../assets/sound/pawn/pawn_4.mp3'),
    new Audio('../assets/sound/pawn/pawn_5.mp3'),
  ];

  cardSounds = [
    new Audio('../assets/sound/card/card_1.mp3'),
    new Audio('../assets/sound/card/card_2.mp3'),
    new Audio('../assets/sound/card/card_3.mp3'),
    new Audio('../assets/sound/card/card_4.mp3'),
    new Audio('../assets/sound/card/card_5.mp3'),
    new Audio('../assets/sound/card/card_6.mp3'),
  ];


  dialogSounds = [
    new Audio('../assets/sound/dialog/dialog_1.mp3'),
    new Audio('../assets/sound/dialog/dialog_2.mp3'),
    new Audio('../assets/sound/dialog/dialog_3.mp3'),
    new Audio('../assets/sound/dialog/dialog_4.mp3'),
    new Audio('../assets/sound/dialog/dialog_5.mp3'),
  ];

  cashSounds = [
    new Audio('../assets/sound/cash/cash_1.mp3'),
    new Audio('../assets/sound/cash/cash_2.mp3'),
    new Audio('../assets/sound/cash/cash_3.mp3'),
  ];


  currentMusic:HTMLAudioElement | undefined;
  playingDiceSoundIndex:Array<number>= [];

  audioContext!: AudioContext;

  constructor(public settingsService : SettingsService) { }

  initializeAudioContext(){
    this.audioContext = new AudioContext();
    this.loadSound();
  }

  playAmbientMusic(){
    this.enableMusic = this.settingsService.settings.sound.enabledMusic;
    this.currentMusic = new Audio('../assets/music/'+ this.chooseRandomAudio(1,6) +'.mp3');
    this.currentMusic.volume = this.settingsService.settings.sound.musicVolume;
    if(this.enableMusic){
      this.currentMusic.play();
    }
  
      interval((190000)).subscribe({
        next: (data) => {
          this.currentMusic = new Audio('../assets/music/'+ this.chooseRandomAudio(1,6) +'.mp3');
          this.currentMusic.volume = this.settingsService.settings.sound.musicVolume;
          if(this.enableMusic){
            this.currentMusic.play();
          }
        }
      })
  }

  handleMusic(enabled:boolean){
    if(!enabled){
      this.currentMusic?.pause();
    } else{
      this.currentMusic?.play();
    }
  }

  changeMusicVolume(){
    if(this.currentMusic){
      this.currentMusic.volume = this.settingsService.settings.sound.musicVolume;
    }
  }

  loadSound(){
    this.diceSounds.forEach(sound => {
      sound.load();
    });

    this.pawnSounds.forEach(sound => {
      sound.load();
    });

    this.dialogSounds.forEach(sound => {
      sound.load();
    });

    this.cardSounds.forEach(sound => {
      sound.load();
    });

    this.cashSounds.forEach(sound => {
      sound.load();
    });
  }

  playDiceSound(dice:any){

    if(this.settingsService.settings.sound.enabledSfx){
      
      if(this.playingDiceSoundIndex[dice.diceIndex] >= 0 && !this.diceSounds[this.playingDiceSoundIndex[dice.diceIndex]].ended){
        try{
          this.diceSounds[this.playingDiceSoundIndex[dice.diceIndex]].pause();
          this.diceSounds[this.playingDiceSoundIndex[dice.diceIndex]].currentTime = 0;
        }catch{}
      }

      let index = Math.round((Math.random() * (this.diceSounds.length - 1) - 0) + 0);

      if(this.playingDiceSoundIndex[dice.diceIndex] >= 0 && this.playingDiceSoundIndex[dice.diceIndex] === index){
        while(this.playingDiceSoundIndex[dice.diceIndex] === index){
          index = Math.round((Math.random() * (this.diceSounds.length - 1) - 0) + 0);
        }
      }

      if(index && this.diceSounds[index]){
        if(dice.body.velocity >= 5)
          this.diceSounds[index].volume = 0.6;
        else if(dice.body.velocity >= 3)
          this.diceSounds[index].volume = 0.4;
        else if(dice.body.velocity <= 3)
          this.diceSounds[index].volume = 0.2;

        this.playingDiceSoundIndex[dice.diceIndex] = index;
      
        try{
          this.diceSounds[index].play();
        }catch{}

      }
      
    }

  }

  playSound(sound:string){
    if(this.settingsService.settings.sound.enabledSfx){
      let audio;
      switch (sound) {
        case 'money':
          const cashI = this.chooseRandomAudio(1,this.cashSounds.length - 1)
          audio = this.cashSounds[cashI];
          break;
        case 'open-dialog':
          const dialogI = this.chooseRandomAudio(1,this.dialogSounds.length - 1)
          audio = this.dialogSounds[dialogI];
          break;
        case 'open-card':
          const cardI = this.chooseRandomAudio(1,this.cardSounds.length - 1)
          audio = this.cardSounds[cardI];
          break;
        case 'pawn-move':
          const pawnI = this.chooseRandomAudio(1,this.pawnSounds.length - 1)
          audio = this.pawnSounds[pawnI];
          break;
        default:
          break;
      }
  
      if(audio){
        try{audio.pause()}
        catch{}
        audio.currentTime = 0;
        audio.volume = this.settingsService.settings.sound.sfxVolume;
        try{audio.play()}
        catch{}
      }
    }
  }

  chooseRandomAudio(min:number , max:number){
    return Math.floor(Math.random() * (max - min + 1)) + min;;
  }
}
