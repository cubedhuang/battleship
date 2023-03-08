import type { Player } from './Player';

export class Battleship {
	private players: Player[] = [];

	getPlayer(index: number) {
		return this.players[index];
	}

	addPlayer(player: Player) {
		this.players.push(player);
	}

	upkeep() {
		// this.players.forEach((player) => {
		// 	player.getGuessBoard().forEach((row) => {
		// 		row.forEach((col, index) => {
		// 			if (col === 'X') {
		// 				row[index] = ' ';
		// 			}
		// 		});
		// 	});
		// });
	}
}
