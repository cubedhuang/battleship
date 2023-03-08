import { Guess } from './Guess';
import { Location } from './Location';
import { Player } from './Player';
import {
	Carrier,
	Cruiser,
	Destroyer,
	Orientation,
	PatrolBoat,
	Ship,
	Submarine
} from './Ship';

export class ComputerPlayer extends Player {
	attack(player: Player, _: Location) {
		const location = this.getRandomLocation();

		if (!player.hasShipAt(location)) {
			this.guessBoard[location.row][location.col] = Guess.Miss;

			return false;
		}

		const ship = player.getShip(location)!;
		ship.hit(location);

		this.guessBoard[location.row][location.col] = Guess.Hit;

		return true;
	}

	private getRandomLocation() {
		const locations = this.getEmptyLocations();
		const location =
			locations[Math.floor(Math.random() * locations.length)];

		return location;
	}

	private getEmptyLocations() {
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

		for (const CurrentShip of ships) {
			while (true) {
				const ship = new CurrentShip(
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

	private canPlaceShip(ship: Ship) {
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
}