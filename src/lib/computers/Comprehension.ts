import { ComputerPlayer } from './ComputerPlayer';
import { Location } from '../Location';
import { HitResult, Player } from '../Player';

/**
 * Different possible pieces of information about a cell.
 */
enum GuessState {
	Unknown,
	Miss,
	Hit,

	/**
	 * A ship has been sunk, but we don't know exactly which one.
	 */
	SunkUnknownShip,

	/**
	 * A ship has been sunk, and we know the location of all of its cells.
	 */
	SunkConfirmed
}

export class Comprehension extends ComputerPlayer {
	/**
	 * Ships of the given length that have not yet been sunk.
	 */
	private shipsLeft = [5, 4, 3, 3, 2];

	/**
	 * Cells that are guaranteed to be part of a ship and must be attacked.
	 */
	private priorityCells: Location[] = [];

	/**
	 * We don't use the `guessBoard` from the `ComputerPlayer` class, because we
	 * need to keep track of more information than just whether a cell has been
	 * hit or missed.
	 */
	private guesses: GuessState[][];

	/**
	 * For each cell, how many spaces away from it our nearest guesses currently
	 * are. `openDistances[i][j]` will be [top, right, bottom, left] with their
	 * distances away respectively.
	 */
	private openDistances: number[][][];

	/**
	 * Track how many configurations of ships include each cell based on the
	 * current hits around it.
	 */
	private hitsHeatMap: number[][];

	/**
	 * Track how many configurations of ships include each cell based on the
	 * unknown cells around it.
	 */
	private unknownHeatMap: number[][];

	constructor() {
		super();

		this.guesses = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => GuessState.Unknown)
		);

		this.openDistances = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () =>
				Array.from({ length: 10 }, () => 0)
			)
		);

		this.hitsHeatMap = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => 0)
		);

		this.unknownHeatMap = Array.from({ length: 10 }, () =>
			Array.from({ length: 10 }, () => 0)
		);
	}

	override attack(player: Player, _: Location) {
		const location = this.getNextAttackLocation()!;

		const result = player.hit(location);

		if (result === HitResult.Miss) {
			this.guesses[location.row][location.col] = GuessState.Miss;
			return;
		}

		this.guesses[location.row][location.col] =
			result === HitResult.Sunk
				? GuessState.SunkUnknownShip
				: GuessState.Hit;

		if (result === HitResult.Hit) return;

		// Check if the sunk location confirms a ship

		// Find how far the hits or unconfirmed sunk ships extend

		const { row, col } = location;

		const leftHitCol = this.getHitLength(row, col, 0, -1);
		const rightHitCol = this.getHitLength(row, col, 0, 1);
		const width = rightHitCol - leftHitCol + 1;

		const topHitRow = this.getHitLength(row, col, -1, 0);
		const bottomHitRow = this.getHitLength(row, col, 1, 0);
		const height = bottomHitRow - topHitRow + 1;

		if (width > 1 && height > 1) return;

		const shipLength = width > 1 ? width : height;

		// Check if there is only one ship of that length or lower left

		const shipsLeft = this.shipsLeft.filter(length => length <= shipLength);

		if (shipsLeft.length === 1) {
			const index = this.shipsLeft.indexOf(shipsLeft[0]);

			this.shipsLeft.splice(index, 1);
		}
	}

	/**
	 * Starting from a location, find the furthest row or column that is a hit or
	 * an unconfirmed sunk ship.
	 */
	private getHitLength(
		row: number,
		col: number,
		rowDelta: number,
		colDelta: number,
		includeUnknown = false
	) {
		if (rowDelta) {
			while (
				row + rowDelta >= 0 &&
				row + rowDelta < 10 &&
				(this.guesses[row + rowDelta][col] === GuessState.Hit ||
					this.guesses[row + rowDelta][col] ===
						GuessState.SunkUnknownShip ||
					(includeUnknown &&
						this.guesses[row + rowDelta][col] ===
							GuessState.Unknown))
			) {
				row += rowDelta;
			}

			return row;
		}

		while (
			this.guesses[row][col + colDelta] === GuessState.Hit ||
			this.guesses[row][col + colDelta] === GuessState.SunkUnknownShip ||
			(includeUnknown &&
				this.guesses[row][col + colDelta] === GuessState.Unknown)
		) {
			col += colDelta;
		}

		return col;
	}

	/**
	 * Helper method to determine the next location to attack.
	 */
	private getNextAttackLocation() {
		this.markSunkFromSurroundings();
		this.markConfirmedSunkLocations();

		if (this.priorityCells.length) {
			return this.priorityCells.shift();
		}

		// Check for other locations near Hits
		const location = this.getNewHitLocation();

		if (location) return location;

		return this.getNewUnknownLocation();
	}

	/**
	 * Go through every Hit and mark it as sunk if, on every side, Hits continue
	 * until they hit another Hit or a location we have investigated before.
	 */
	private markSunkFromSurroundings() {
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (
					this.guesses[row][col] !== GuessState.Hit ||
					// top
					!this.isBoundedByKnown(row, col, -1, 0) ||
					// right
					!this.isBoundedByKnown(row, col, 0, 1) ||
					// bottom
					!this.isBoundedByKnown(row, col, 1, 0) ||
					// left
					!this.isBoundedByKnown(row, col, 0, -1)
				) {
					continue;
				}

				this.guesses[row][col] = GuessState.SunkUnknownShip;
			}
		}
	}

	/**
	 * Check if a location is bounded by hits in a direction until a known guess
	 * or the edge of the board.
	 */
	private isBoundedByKnown(
		row: number,
		col: number,
		rowDelta: number,
		colDelta: number
	) {
		let currentRow = row + rowDelta;
		let currentCol = col + colDelta;

		while (
			currentRow > 0 &&
			currentRow < 10 &&
			this.guesses[currentRow][currentCol] === GuessState.Hit
		) {
			currentRow += rowDelta;
			currentCol += colDelta;
		}

		return (
			currentRow < 0 ||
			currentRow > 9 ||
			currentCol < 0 ||
			currentCol > 9 ||
			this.guesses[currentRow][currentCol] !== GuessState.Unknown
		);
	}

	/**
	 * Go through each Hit and SunkUnknownShip and determine how the ships left
	 * could be placed. If there is only one possible ship that could be placed
	 * there, mark each of the locations as SunkConfirmed, remove the ship
	 * from the list of ships left, and add the locations to the priority list.
	 */
	private markConfirmedSunkLocations() {
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (
					this.guesses[row][col] !== GuessState.Hit &&
					this.guesses[row][col] !== GuessState.SunkUnknownShip
				) {
					continue;
				}

				const leftHitCol = this.getHitLength(row, col, 0, -1, true);
				const rightHitCol = this.getHitLength(row, col, 0, 1, true);
				const width = rightHitCol - leftHitCol + 1;

				const topHitRow = this.getHitLength(row, col, -1, 0, true);
				const bottomHitRow = this.getHitLength(row, col, 1, 0, true);
				const height = bottomHitRow - topHitRow + 1;

				if (width > 1 && height > 1) continue;

				const size = width > 1 ? width : height;

				const shipsLeft = this.shipsLeft.filter(
					length => length <= size
				);

				if (shipsLeft.length === 1 && shipsLeft[0] === size) {
					const shipLength = shipsLeft[0];

					if (width === shipLength) {
						for (let i = leftHitCol; i <= rightHitCol; i++) {
							if (this.guesses[row][i] === GuessState.Unknown) {
								this.priorityCells.push(new Location(row, i));
							}
							this.guesses[row][i] = GuessState.SunkConfirmed;
						}
					} else {
						for (let i = topHitRow; i <= bottomHitRow; i++) {
							if (this.guesses[row][i] === GuessState.Unknown) {
								this.priorityCells.push(new Location(i, col));
							}
							this.guesses[i][col] = GuessState.SunkConfirmed;
						}
					}

					this.shipsLeft.splice(
						this.shipsLeft.indexOf(shipLength),
						1
					);
				}
			}
		}
	}

	/**
	 * Creates a heat map based on where ships could be placed based on the
	 * current state of the unknown hits on the board. Returns the location
	 * with the highest heat value.
	 */
	private getNewHitLocation() {
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				this.hitsHeatMap[row][col] = 0;
			}
		}

		let sum = 0;

		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (this.guesses[row][col] !== GuessState.Hit) continue;

				for (const length of this.shipsLeft) {
					const leftHitCol = Math.max(
						this.getHitLength(row, col, 0, -1, true),
						col - length + 1
					);
					const rightHitCol = Math.min(
						this.getHitLength(row, col, 0, 1, true),
						col + length - 1
					);
					const width = rightHitCol - leftHitCol + 1;

					if (width >= length) {
						for (let i = leftHitCol; i <= rightHitCol; i++) {
							if (this.guesses[row][i] === GuessState.Unknown) {
								this.hitsHeatMap[row][i] += 1;
								sum += 1;
							}
						}
					}

					const topHitRow = Math.max(
						this.getHitLength(row, col, -1, 0, true),
						row - length + 1
					);
					const bottomHitRow = Math.min(
						this.getHitLength(row, col, 1, 0, true),
						row + length - 1
					);
					const height = bottomHitRow - topHitRow + 1;

					if (height >= length) {
						for (let i = topHitRow; i <= bottomHitRow; i++) {
							if (this.guesses[i][col] === GuessState.Unknown) {
								this.hitsHeatMap[i][col] += 1;
								sum += 1;
							}
						}
					}
				}
			}
		}

		if (sum === 0) return null;

		return this.getHighestHeatMapLocation(this.hitsHeatMap);
	}

	/**
	 * Creates a heat map based on where ships could be placed based on the
	 * current state of the unknown hits on the board. Returns the location
	 * with the highest heat value.
	 */
	private getNewUnknownLocation() {
		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				this.findOpenDistancesAt(row, col);

				const [top, right, bottom, left] = this.openDistances[row][col];

				let sum = 0;

				for (const length of this.shipsLeft) {
					const topPossibilites = Math.min(top, length - 1);
					const bottomPossibilites = Math.min(bottom, length - 1);
					const possibilitiesAB =
						topPossibilites + bottomPossibilites + 1 - length + 1;
					if (possibilitiesAB > 0) sum += possibilitiesAB;

					const leftPossibilites = Math.min(left, length - 1);
					const rightPossibilites = Math.min(right, length - 1);
					const possibilitiesLR =
						leftPossibilites + rightPossibilites + 1 - length + 1;
					if (possibilitiesLR > 0) sum += possibilitiesLR;
				}

				this.unknownHeatMap[row][col] = sum;
			}
		}

		return this.getHighestHeatMapLocation(this.unknownHeatMap);
	}

	/**
	 * Given a heat map, return the location with the highest heat value or
	 * a random location with the highest heat value if there are multiple.
	 */
	private getHighestHeatMapLocation(heatMap: number[][]) {
		let max = 0;
		let count = 0;

		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (heatMap[row][col] > max) {
					max = heatMap[row][col];
					count = 1;
				} else if (heatMap[row][col] === max) {
					count += 1;
				}
			}
		}

		const random = Math.floor(Math.random() * count);

		count = 0;

		for (let row = 0; row < 10; row++) {
			for (let col = 0; col < 10; col++) {
				if (heatMap[row][col] === max) {
					if (count === random) {
						return new Location(row, col);
					}
					count += 1;
				}
			}
		}

		return null;
	}

	/**
	 * Determine how far on each side of a location there are open spaces.
	 * Adds the value to the `openDistances` array. Left and top sides are
	 * based on previous values to avoid extra calculations.
	 */
	private findOpenDistancesAt(row: number, col: number) {
		if (this.guesses[row][col] !== GuessState.Unknown) {
			this.openDistances[row][col] = [0, 0, 0, 0];
			return;
		}

		const top =
			row === 0 || this.guesses[row - 1][col] !== GuessState.Unknown
				? 0
				: this.openDistances[row - 1][col][0] + 1;
		const left =
			col === 0 || this.guesses[row][col - 1] !== GuessState.Unknown
				? 0
				: this.openDistances[row][col - 1][3] + 1;
		const right = this.getOpenDistance(row, col, 0, 1);
		const bottom = this.getOpenDistance(row, col, 1, 0);

		this.openDistances[row][col] = [top, right, bottom, left];
	}

	/**
	 * Get how far the unknown distance is from a location in a given direction.
	 */
	private getOpenDistance(
		row: number,
		col: number,
		rowDelta: number,
		colDelta: number
	) {
		let distance = 0;

		while (true) {
			row += rowDelta;
			col += colDelta;

			if (
				row < 0 ||
				row >= 10 ||
				col < 0 ||
				col >= 10 ||
				this.guesses[row][col] !== GuessState.Unknown
			) {
				break;
			}

			distance++;
		}

		return distance;
	}

	// Debugging and inspection getters

	getGuesses() {
		return this.guesses;
	}

	getUnknownHeatMap() {
		return this.unknownHeatMap;
	}

	getHitsHeatMap() {
		return this.hitsHeatMap;
	}

	getShipsLeft() {
		return this.shipsLeft;
	}
}
