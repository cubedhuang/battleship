import { Guess } from './Guess';
import type { Location } from './Location';
import type { Ship } from './Ship';

export abstract class Player {
	private ships: Ship[] = [];
	protected guessBoard: Guess[][];
	protected hits: Location[] = [];

	constructor() {
		this.guessBoard = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => Guess.Empty)
		);

		this.placeShips();
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

	canPlaceShip(ship: Ship) {
		for (const location of ship.getLocations()) {
			if (
				location.row < 0 ||
				location.row > 9 ||
				location.col < 0 ||
				location.col > 9 ||
				this.hasShipAt(location)
			) {
				return false;
			}
		}

		return true;
	}

	getHits() {
		return this.hits;
	}

	hit(location: Location) {
		this.hits.push(location);

		if (!this.hasShipAt(location)) return false;

		const ship = this.getShip(location)!;
		ship.hit(location);

		return true;
	}

	wasHitAt(location: Location) {
		return this.hits.some(hit => hit.equals(location));
	}

	getGuessBoard() {
		return this.guessBoard;
	}

	abstract attack(player: Player, location: Location): void;
	abstract placeShips(): void;
}
