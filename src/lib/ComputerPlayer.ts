import { Guess } from './Guess';
import { Location } from './Location';
import { Player } from './Player';
import {
	Carrier,
	Cruiser,
	Destroyer,
	Orientation,
	PatrolBoat,
	Submarine
} from './Ship';

export class ComputerPlayer extends Player {
	attack(player: Player, _: Location) {
		const location = this.getRandomLocation();

		const result = player.hit(location);

		this.guessBoard[location.row][location.col] = result
			? Guess.Hit
			: Guess.Miss;
	}

	protected getRandomLocation() {
		const locations = this.getEmptyLocations();
		const location =
			locations[Math.floor(Math.random() * locations.length)];

		return location;
	}

	protected getEmptyLocations() {
		const locations: Location[] = [];

		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (this.guessBoard[row][col] === Guess.Empty) {
					locations.push(new Location(row, col));
				}
			}
		}

		return locations;
	}

	placeShips() {
		const ships = [Carrier, Cruiser, Destroyer, PatrolBoat, Submarine];

		for (const Ship of ships) {
			while (true) {
				const ship = new Ship(
					this.getRandomLocation(),
					Math.random() < 0.5
						? Orientation.Horizontal
						: Orientation.Vertical
				);

				if (this.canPlaceShip(ship)) {
					this.addShip(ship);

					break;
				}
			}
		}
	}
}
