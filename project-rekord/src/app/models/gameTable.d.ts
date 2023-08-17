import { cardModel } from "./card";
import { chanceModel } from "./chance";
import { chestModel } from "./chest";

export interface gameTableModel {
    cards: Array<cardModel>,
    chance: Array<chanceModel>
    communitychest: Array<chestModel>
}