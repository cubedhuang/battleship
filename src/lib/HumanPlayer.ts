import { CellState } from './CellState';
import type { Location } from './Location';
import { HitResultType, Player } from './Player';

export class HumanPlayer extends Player {
	attack(player: Player, location: Location) {
		const result = player.hit(location);

		this.guessBoard[location.row][location.col] =
			result.type !== HitResultType.Miss ? CellState.Hit : CellState.Miss;
	}

	/**
	 * Ships will be added through the `addShip` method.
	 */
	placeShips() {}
}
