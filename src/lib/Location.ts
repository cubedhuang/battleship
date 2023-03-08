export class Location {
	constructor(public row: number, public col: number) {}

	equals(location: Location) {
		return this.row === location.row && this.col === location.col;
	}
}
