import { Injectable } from '@angular/core';
import { interval } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SoundService {

  enableMusic:boolean = true;
  enableSoundsEffects:boolean = true;

  musicVolume:number = 0.1;
  soundVolume:number = 1;

  
  diceSounds = [
    new Audio('../assets/sound/dice/1.wav'),
    new Audio('../assets/sound/dice/2.wav'),
    new Audio('../assets/sound/dice/3.wav'),
    new Audio('../assets/sound/dice/4.wav'),
    new Audio('../assets/sound/dice/5.wav'),
    new Audio('../assets/sound/dice/6.wav'),
    new Audio('../assets/sound/dice/7.wav'),
  ];

  currentMusic:HTMLAudioElement | undefined;
  playingDiceSoundIndex:Array<number>= [];

  audioContext!: AudioContext;

  constructor() { }

  initializeAudioContext(){
    this.audioContext = new AudioContext();
    this.loadSound();
  }

  playAmbientMusic(){

    if(this.enableMusic){
      this.currentMusic = new Audio('../assets/music/'+ this.chooseRandomAudio(1,6) +'.mp3');
      this.currentMusic.volume = this.musicVolume;
      this.currentMusic.play();
  
      interval((190000)).subscribe({
        next: (data) => {
          this.currentMusic = new Audio('../assets/music/'+ this.chooseRandomAudio(1,6) +'.mp3');
          this.currentMusic.volume = this.musicVolume;
          if(this.enableMusic){
            this.currentMusic.play();
          }
        }
      })
    }
  }

  handleMusic(){
    if(this.enableMusic){
      this.currentMusic?.pause();
    } else{
      this.currentMusic?.play();
    }
  }

  changeMusicVolume(){
    if(this.currentMusic){
      this.currentMusic.volume = this.musicVolume;
    }
  }

  loadSound(){
    this.diceSounds.forEach(sound => {
      sound.load();
    });
  }

  playDiceSound(dice:any){

    if(this.enableSoundsEffects){
      
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

  chooseRandomAudio(min:number , max:number){
    return Math.round((Math.random() * max - min) + min);
  }
}
