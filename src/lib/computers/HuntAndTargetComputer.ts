import { ComputerPlayer } from './ComputerPlayer';
import { CellState } from '../CellState';
import { Location } from '../Location';
import { HitResultType, type Player } from '../Player';

export class HuntAndTargetComputer extends ComputerPlayer {
	private stack: Location[] = [];

	override attack(player: Player, _: Location) {
		// If the stack is empty, we need to find a new location to attack.
		const location = this.stack.length
			? this.stack.shift()!
			: this.getRandomEvenLocation();

		const result = player.hit(location);

		this.guessBoard[location.row][location.col] =
			result.type !== HitResultType.Miss ? CellState.Hit : CellState.Miss;

		if (result.type !== HitResultType.Miss) {
			const candidates = [
				new Location(location.row - 1, location.col),
				new Location(location.row + 1, location.col),
				new Location(location.row, location.col - 1),
				new Location(location.row, location.col + 1)
			];

			for (const candidate of candidates) {
				if (
					this.isValidLocation(candidate) &&
					this.guessBoard[candidate.row][candidate.col] ===
						CellState.Empty &&
					!this.stack.some(location => location.equals(candidate))
				) {
					this.stack.push(candidate);
				}
			}
		}
	}

	protected isValidLocation(location: Location) {
		return (
			location.row >= 0 &&
			location.row < 10 &&
			location.col >= 0 &&
			location.col < 10
		);
	}

	protected getRandomEvenLocation() {
		const locations = this.getEmptyLocations().filter(
			location => (location.row + location.col) % 2 === 0
		);
		const location =
			locations[Math.floor(Math.random() * locations.length)];

		return location;
	}
}
