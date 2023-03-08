import { Guess } from './Guess';
import type { Location } from './Location';
import type { Ship } from './Ship';

export abstract class Player {
	private ships: Ship[] = [];
	protected guessBoard: string[][];
	protected hits: Location[] = [];

	constructor(private name: string) {
		this.guessBoard = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => Guess.Empty)
		);

		this.placeShips();
	}

	getName() {
		return this.name;
	}

	getNumberOfShips() {
		return this.ships.length;
	}

	getShip(location: Location) {
		return this.ships.find(ship => ship.has(location));
	}

	getShips() {
		return this.ships;
	}

	addShip(ship: Ship) {
		this.ships.push(ship);
	}

	removeShip(ship: Ship) {
		this.ships = this.ships.filter(s => s !== ship);
	}

	hasShipAt(location: Location) {
		return this.getShip(location) !== undefined;
	}

	getHits() {
		return this.hits;
	}

	hit(location: Location) {
		this.hits.push(location);

		if (!this.hasShipAt(location)) {
			this.guessBoard[location.row][location.col] = Guess.Miss;

			return false;
		}

		const ship = this.getShip(location)!;
		ship.hit(location);

		this.guessBoard[location.row][location.col] = Guess.Hit;

		return true;
	}

	wasHitAt(location: Location) {
		return this.hits.some(hit => hit.equals(location));
	}

	getGuessBoard() {
		return this.guessBoard;
	}

	equals(player: Player) {
		return this.name === player.name;
	}

	abstract attack(player: Player, location: Location): boolean;
	abstract placeShips(): void;
}
