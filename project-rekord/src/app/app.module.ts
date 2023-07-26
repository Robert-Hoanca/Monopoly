import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/pages/home/home.component';
import { GameComponent } from './components/pages/game/game.component';
import { CardComponent } from './components/card/card.component';
import { PawnComponent } from './components/pawn/pawn.component';

//firestore
import { provideFirebaseApp, getApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from 'src/environments/environment';
import { AngularFireModule } from '@angular/fire/compat';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//MATERIAL
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CardDialogComponent } from './shared/card-dialog/card-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ChooseModeComponent } from './components/pages/choose-mode/choose-mode.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';




//NGX THREE
import { NgxThreeModule } from 'ngx-three';
import { ExchangeComponent } from './shared/exchange/exchange.component';
import { PlayerComponent } from './components/player/player.component';
import { HouseComponent } from './shared/house/house.component';
import { HotelComponent } from './shared/hotel/hotel.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessageDialogComponent } from './shared/message-dialog/message-dialog.component';
import { PlayerPropertiesComponent } from './shared/player-properties/player-properties.component';
import { DiceComponent } from './shared/dice/dice.component';
import { DecorationItemComponent } from './shared/decoration-item/decoration-item.component';
import { WaterWaveItemComponent } from './shared/decorations/water-wave-item/water-wave-item.component';
import { CloudItemComponent } from './shared/decorations/cloud-item/cloud-item.component';
import { BoatItemComponent } from './shared/decorations/boat-item/boat-item.component';
import { LoadingScreenComponent } from './shared/loading-screen/loading-screen.component';
import { ThemeEditorComponent } from './components/pages/theme-editor/theme-editor.component';
import { GameTableEditorComponent } from './components/pages/game-table-editor/game-table-editor.component';
import { GrassItemComponent } from './shared/decorations/grass-item/grass-item.component';
import { RainDropsItemComponent } from './shared/decorations/rain-drops-item/rain-drops-item.component';
import { AboutComponent } from './components/pages/about/about.component';
import { SettingsComponent } from './shared/settings/settings.component';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { SaveComponent } from './shared/save/save.component';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    GameComponent,
    CardComponent,
    PawnComponent,
    CardDialogComponent,
    ChooseModeComponent,
    ExchangeComponent,
    PlayerComponent,
    HouseComponent,
    HotelComponent,
    MessageDialogComponent,
    PlayerPropertiesComponent,
    DiceComponent,
    DecorationItemComponent,
    WaterWaveItemComponent,
    CloudItemComponent,
    BoatItemComponent,
    LoadingScreenComponent,
    ThemeEditorComponent,
    GameTableEditorComponent,
    GrassItemComponent,
    RainDropsItemComponent,
    AboutComponent,
    SettingsComponent,
    SaveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    provideFirestore(() => getFirestore()),
    AngularFireDatabaseModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
    FlexLayoutModule,
    MatIconModule,
    MatCheckboxModule,
    MatPaginatorModule,
    NgxThreeModule,
    MatSliderModule,
    MatSelectModule,
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
