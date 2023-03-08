import { Guess } from './Guess';
import type { Location } from './Location';
import { Player } from './Player';

export class HumanPlayer extends Player {
	attack(player: Player, location: Location) {
		const result = player.hit(location);

		this.guessBoard[location.row][location.col] = result
			? Guess.Hit
			: Guess.Miss;

		return true;
	}

	/**
	 * Ships will be added through the `addShip` method.
	 */
	placeShips() {}
}
