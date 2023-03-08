import { Guess } from './Guess';
import type { Location } from './Location';
import { Player } from './Player';

export class HumanPlayer extends Player {
	attack(player: Player, location: Location) {
		if (!player.hasShipAt(location)) {
			this.guessBoard[location.row][location.col] = Guess.Miss;

			return false;
		}

		const ship = player.getShip(location)!;
		ship.hit(location);

		this.guessBoard[location.row][location.col] = Guess.Hit;

		return true;
	}

	/**
	 * Ships will be added through the `addShip` method.
	 */
	placeShips() {}
}
