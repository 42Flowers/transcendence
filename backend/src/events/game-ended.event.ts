import { Game } from "src/game/game";

export class GameEndedEvent {
    constructor(public readonly game: Game) {}
}
