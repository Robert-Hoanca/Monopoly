import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
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
import { ChooseModeComponent } from './components/choose-mode/choose-mode.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';



//NGX THREE
import { NgxThreeModule } from 'ngx-three';
import { ExchangeComponent } from './shared/exchange/exchange.component';
import { PlayerComponent } from './components/player/player.component';
import { MapComponent } from './components/map/map.component';
import { HouseComponent } from './shared/house/house.component';
import { HotelComponent } from './shared/hotel/hotel.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessageDialogComponent } from './shared/message-dialog/message-dialog.component';
import { PlayerPropertiesComponent } from './shared/player-properties/player-properties.component';

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
    MapComponent,
    HouseComponent,
    HotelComponent,
    MessageDialogComponent,
    PlayerPropertiesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    provideFirestore(() => getFirestore()),
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
    
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
