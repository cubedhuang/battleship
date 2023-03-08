import { Location } from './Location';

export enum Orientation {
	Horizontal = 'Horizontal',
	Vertical = 'Vertical'
}

export class Ship {
	private locations: Location[];
	private hits: Location[] = [];

	constructor(
		private name: string,
		private length: number,
		private start: Location,
		private orientation: Orientation
	) {
		this.locations = Array.from({ length }, (_, index) => {
			if (orientation === Orientation.Horizontal) {
				return new Location(start.row, start.col + index);
			} else {
				return new Location(start.row + index, start.col);
			}
		});
	}

	has(location: Location) {
		return this.locations.some(loc => loc.equals(location));
	}

	hit(location: Location) {
		this.hits.push(location);
	}

	isHorizontal() {
		return this.orientation === Orientation.Horizontal;
	}

	getLocations() {
		return this.locations;
	}

	isSunk() {
		return this.hits.length === this.length;
	}
}

export class Carrier extends Ship {
	static readonly LENGTH = 5;

	constructor(start: Location, orientation: Orientation) {
		super('Carrier', 5, start, orientation);
	}
}

export class Destroyer extends Ship {
	static readonly LENGTH = 4;

	constructor(start: Location, orientation: Orientation) {
		super('Battleship', 4, start, orientation);
	}
}

export class Cruiser extends Ship {
	static readonly LENGTH = 3;

	constructor(start: Location, orientation: Orientation) {
		super('Cruiser', 3, start, orientation);
	}
}

export class Submarine extends Ship {
	static readonly LENGTH = 3;

	constructor(start: Location, orientation: Orientation) {
		super('Submarine', 3, start, orientation);
	}
}

export class PatrolBoat extends Ship {
	static readonly LENGTH = 2;

	constructor(start: Location, orientation: Orientation) {
		super('Patrol Boat', 2, start, orientation);
	}
}
