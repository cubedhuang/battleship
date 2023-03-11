import { CellState } from './CellState';
import type { Location } from './Location';
import type { Ship } from './Ship';

export enum HitResult {
	Miss,
	Hit,
	Sunk
}

export abstract class Player {
	private ships: Ship[] = [];
	protected guessBoard: CellState[][];
	protected hits: Location[] = [];

	constructor() {
		this.guessBoard = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => CellState.Empty)
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
		if (this.hits.some(hit => hit.equals(location))) {
			console.warn('Already hit this location', location);
			return this.hasShipAt(location) ? HitResult.Hit : HitResult.Miss;
		}

		this.hits.push(location);

		if (!this.hasShipAt(location)) return HitResult.Miss;

		const ship = this.getShip(location)!;
		ship.hit(location);

		return ship.isSunk() ? HitResult.Sunk : HitResult.Hit;
	}

	wasHitAt(location: Location) {
		return this.hits.some(hit => hit.equals(location));
	}

	getGuessBoard() {
		return this.guessBoard;
	}

	isDead() {
		return this.ships.every(ship => ship.isSunk());
	}

	abstract attack(player: Player, location: Location): void;
	abstract placeShips(): void;
}
