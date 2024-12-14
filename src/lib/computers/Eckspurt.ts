import { ComputerPlayer } from './ComputerPlayer';
import { Location } from '$lib/Location';
import {
	Carrier,
	Cruiser,
	Destroyer,
	Orientation,
	PatrolBoat,
	Ship,
	Submarine
} from '$lib/Ship';
import { type HitResult, HitResultType, Player } from '$lib/Player';

export enum SeaState {
	Unknown,
	Miss,
	Hit,
	Sunk
}

/**
 * Manages attacks over the course of a match.
 */
class Offense {
	player: Eckspurt;

	hitsGiven: number;
	gameState: SeaState[][];
	shipsLeft: number[];

	/**
	 * Debugging variable to store the last heatmap.
	 */
	lastHeatMap: number[][] = [];

	constructor(player: Eckspurt) {
		this.player = player;

		this.hitsGiven = 0;
		this.gameState = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => SeaState.Unknown)
		);
		this.shipsLeft = [5, 4, 3, 3, 2];
	}

	/**
	 * Determines the next location to attack.
	 *
	 * @return The next location to attack.
	 */
	getNextAttackLocation() {
		const heatMap = this.createHeatMap();

		return this.pickBestLocation(heatMap);
	}

	/**
	 * Picks the best location to attack based on the heatmap. If there are
	 * multiple locations with the same score, one is chosen at random.
	 *
	 * @param heatMap The heatmap.
	 * @return The best location to attack.
	 */
	private pickBestLocation(heatMap: number[][]) {
		let max = 0;
		let count = 0;

		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				if (heatMap[i][j] > max) {
					max = heatMap[i][j];
					count = 1;
				} else if (heatMap[i][j] === max) {
					count++;
				}
			}
		}

		let index = Math.floor(Math.random() * count);

		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				if (heatMap[i][j] === max) {
					if (index === 0) return new Location(i, j);
					else index--;
				}
			}
		}

		throw new Error('unreachable: no best location found');
	}

	/**
	 * Creates a heatmap of the opponent's ship locations.
	 *
	 * @return The heatmap.
	 */
	private createHeatMap() {
		const heatMap = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => 0)
		);

		this.addOpenSpaces(heatMap);
		this.addHitSpaces(heatMap);

		this.lastHeatMap = heatMap;

		return heatMap;
	}

	/**
	 * For each unknown space, add the number of possible arrangements of
	 * ships that could be there.
	 *
	 * @param heatMap The heatmap to modify.
	 */
	addOpenSpaces(heatMap: number[][]) {
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (this.gameState[row][col] !== SeaState.Unknown) continue;

				let left = 0;
				while (
					col - left >= 0 &&
					this.gameState[row][col - left] === SeaState.Unknown
				)
					left++;

				let right = 0;
				while (
					col + right < 10 &&
					this.gameState[row][col + right] === SeaState.Unknown
				)
					right++;

				let up = 0;
				while (
					row - up >= 0 &&
					this.gameState[row - up][col] === SeaState.Unknown
				)
					up++;

				let down = 0;
				while (
					row + down < 10 &&
					this.gameState[row + down][col] === SeaState.Unknown
				)
					down++;

				for (const length of this.shipsLeft) {
					const l = Math.min(left, length);
					const r = Math.min(right, length);
					const u = Math.min(up, length);
					const d = Math.min(down, length);

					const width = l + r - 1;
					const height = u + d - 1;

					if (width >= length)
						heatMap[row][col] += width - length + 1;

					if (height >= length)
						heatMap[row][col] += height - length + 1;
				}
			}
		}
	}

	/**
	 * For each hit space, increase the weight of the surrounding spaces
	 * based on the number of ships that could be there.
	 *
	 * @param heatMap The heatmap to modify.
	 */
	private addHitSpaces(heatMap: number[][]) {
		const WEIGHT = 50;

		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (this.gameState[row][col] !== SeaState.Hit) continue;

				let left = 0;
				while (
					col - left >= 0 &&
					(this.gameState[row][col - left] === SeaState.Unknown ||
						this.gameState[row][col - left] === SeaState.Hit)
				)
					left++;

				let right = 0;
				while (
					col + right < 10 &&
					(this.gameState[row][col + right] === SeaState.Unknown ||
						this.gameState[row][col + right] === SeaState.Hit)
				)
					right++;

				let up = 0;
				while (
					row - up >= 0 &&
					(this.gameState[row - up][col] === SeaState.Unknown ||
						this.gameState[row - up][col] === SeaState.Hit)
				)
					up++;

				let down = 0;
				while (
					row + down < 10 &&
					(this.gameState[row + down][col] === SeaState.Unknown ||
						this.gameState[row + down][col] === SeaState.Hit)
				)
					down++;

				for (const length of this.shipsLeft) {
					const l = Math.min(left, length);
					const r = Math.min(right, length);
					const u = Math.min(up, length);
					const d = Math.min(down, length);

					for (let i = col - l + 1; i <= col + r - 1; i++)
						if (this.gameState[row][i] === SeaState.Unknown)
							heatMap[row][i] += WEIGHT;

					for (let i = row - u + 1; i <= row + d - 1; i++)
						if (this.gameState[i][col] === SeaState.Unknown)
							heatMap[i][col] += WEIGHT;
				}
			}
		}
	}

	/**
	 * Given a location and the result of an attack, update the game state.
	 *
	 * @param loc The location of the attack.
	 * @param result The result of the attack.
	 * @param sunkLocations The locations of the ship that was sunk. If no
	 *                      ship was sunk, this should be null.
	 */
	handleResult(loc: Location, result: HitResult) {
		this.hitsGiven++;

		const row = loc.row;
		const col = loc.col;

		this.gameState[row][col] =
			result.type === HitResultType.Miss
				? SeaState.Miss
				: result.type === HitResultType.Hit
				? SeaState.Hit
				: SeaState.Sunk;

		if (result.type === HitResultType.Sunk) {
			const length = result.shipLocations.length;

			for (let i = 0; i < this.shipsLeft.length; i++) {
				if (this.shipsLeft[i] === length) {
					this.shipsLeft.splice(i, 1);
					break;
				}
			}

			for (const sunkLoc of result.shipLocations) {
				this.gameState[sunkLoc.row][sunkLoc.col] = SeaState.Sunk;
			}
		}
	}

	/**
	 * Debugging function to get the game state.
	 */
	getGameState(): readonly SeaState[][] {
		return this.gameState;
	}

	/**
	 * Debugging function to get the ships left.
	 */
	getShipsLeft(): readonly number[] {
		return this.shipsLeft;
	}

	/**
	 * Debugging function to get the last heatmap.
	 */
	getLastHeatMap(): readonly number[][] {
		return this.lastHeatMap;
	}
}

/**
 * Manages ship arrangement over the course of a match.
 */
class Defense {
	player: Eckspurt;

	constructor(player: Eckspurt) {
		this.player = player;
	}

	/**
	 * Generates a random ship configuration.
	 *
	 * @return The ship configuration.
	 */
	createShips() {
		const Ships = [Carrier, PatrolBoat, Cruiser, Submarine, Destroyer];
		const ships = [];

		for (const Ship of Ships) {
			while (true) {
				const start = this.getRandomLocation();
				const isHorizontal = Math.random() < 0.5;

				const ship = new Ship(
					start,
					isHorizontal ? Orientation.Horizontal : Orientation.Vertical
				);

				if (this.canPlaceShip(ship, ships)) {
					ships.push(ship);
					break;
				}
			}
		}

		return ships;
	}

	/**
	 * Given the existing ships, a start location, the length of the ship,
	 * and the orientation, determine whether the three parameters form a
	 * valid ship arrangement. This also adds the additional requirement
	 * that ships cannot be adjacent to each other.
	 *
	 * @param ship The ship to place.
	 * @param existingShips The existing ships.
	 * @return If the ship's placement is valid.
	 */
	private canPlaceShip(ship: Ship, existingShips: Ship[]) {
		for (const location of ship.getLocations()) {
			const row = location.row;
			const col = location.col;

			if (row < 0 || row > 9 || col < 0 || col > 9) {
				return false;
			}

			for (const otherShip of existingShips) {
				for (const otherLocation of otherShip.getLocations()) {
					if (this.isAdjacent(location, otherLocation)) {
						return false;
					}
				}
			}
		}

		return true;
	}

	/**
	 * Returns a random location.
	 *
	 * @return A random location.
	 */
	private getRandomLocation() {
		const row = Math.floor(Math.random() * 10);
		const col = Math.floor(Math.random() * 10);

		return new Location(row, col);
	}

	/**
	 * Determines if two locations are adjacent.
	 *
	 * @param loc1 The first location.
	 * @param loc2 The second location.
	 */
	private isAdjacent(loc1: Location, loc2: Location) {
		const row1 = loc1.row;
		const col1 = loc1.col;
		const row2 = loc2.row;
		const col2 = loc2.col;

		return (
			(row1 === row2 && Math.abs(col1 - col2) === 1) ||
			(col1 === col2 && Math.abs(row1 - row2) === 1)
		);
	}
}

export class Eckspurt extends ComputerPlayer {
	declare offense: Offense;
	declare defense: Defense;

	public constructor() {
		super();
	}

	/**
	 * Because populateShips is called in the Player constructor, I'm using this
	 * as a fake constructor and initializing stuff here.
	 */
	public override placeShips() {
		this.offense = new Offense(this);
		this.defense = new Defense(this);

		const ships = this.defense.createShips();

		for (const ship of ships) {
			this.addShip(ship);
		}
	}

	public override attack(player: Player, _: Location) {
		const location = this.offense.getNextAttackLocation();

		const result = player.hit(location);

		this.offense.handleResult(location, result);
	}
}
