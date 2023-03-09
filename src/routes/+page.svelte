<script lang="ts">
	import { ComputerPlayer } from '$lib/ComputerPlayer';
	import { Guess } from '$lib/Guess';
	import { HumanPlayer } from '$lib/HumanPlayer';
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

	import ShipDisplay from './ShipDisplay.svelte';

	enum Stage {
		Placing,
		Playing
	}

	let stage = Stage.Placing;

	let shipsLeft = [Carrier, Destroyer, Cruiser, Submarine, PatrolBoat];
	let CurrentShip: new (start: Location, orientation: Orientation) => Ship =
		Carrier;
	let currentOrientation = Orientation.Horizontal;
	let ghostShip: Ship | null = null;

	function hoverShip(location: Location) {
		if (stage !== Stage.Placing) return null;

		ghostShip = new CurrentShip(location, currentOrientation);
	}

	function placeShip(location: Location) {
		if (stage !== Stage.Placing) return null;

		ghostShip = new CurrentShip(location, currentOrientation);

		if (ghostShip && player.canPlaceShip(ghostShip)) {
			player.addShip(ghostShip);

			ghostShip = null;
			shipsLeft = shipsLeft.filter(ship => ship !== CurrentShip);

			if (shipsLeft.length > 0) {
				CurrentShip = shipsLeft[0];

				shipsLeft = shipsLeft;
			} else {
				stage = Stage.Playing;
			}

			currentOrientation = Orientation.Horizontal;
			player = player;
		}
	}

	let player = new HumanPlayer();
	let computer = new ComputerPlayer();

	function attack(guess: Guess, location: Location) {
		if (stage !== Stage.Playing || guess !== Guess.Empty) {
			return;
		}

		player.attack(computer, location);
		computer.attack(player, new Location(0, 0));

		player = player;
		computer = computer;
	}
</script>

<svelte:window
	on:keypress={event => {
		if (stage !== Stage.Placing) return;

		if (event.key === 'r') {
			currentOrientation =
				currentOrientation === Orientation.Horizontal
					? Orientation.Vertical
					: Orientation.Horizontal;

			ghostShip = ghostShip
				? new CurrentShip(
						ghostShip.getLocations()[0],
						currentOrientation
				  )
				: null;

			event.preventDefault();
		}
	}}
/>

<div
	class="min-h-screen grid place-items-center
		bg-black text-white"
>
	<div class="flex flex-col gap-2">
		<h1 class="font-black text-center text-4xl">Battleship</h1>

		<div class="flex gap-2">
			<div class="mt-1 area aspect-square grid grid-cols-10">
				{#if stage === Stage.Placing && ghostShip}
					<ShipDisplay
						ship={ghostShip}
						ghost
						valid={player.canPlaceShip(ghostShip)}
					/>
				{/if}

				{#each player.getShips() as ship}
					<ShipDisplay {ship} />
				{/each}

				{#each player.getGuessBoard() as _, row}
					{#each player.getGuessBoard() as _, col}
						{@const location = new Location(row, col)}
						{@const isHit = player.wasHitAt(location)}
						{@const isShip = player.hasShipAt(location)}

						<svelte:element
							this={stage === Stage.Placing && !isShip
								? 'button'
								: 'div'}
							class="group p-1 grid place-items-center"
							style:grid-row={row + 1}
							style:grid-column={col + 1}
							on:mouseover={() => hoverShip(location)}
							on:focus={() => hoverShip(location)}
							on:click={() => placeShip(location)}
							on:keypress|preventDefault
						>
							<div
								class="w-6 h-6 rounded-full border-4 transition-colors
									{isHit && isShip
									? 'border-transparent bg-red-500'
									: isHit
									? 'border-red-500'
									: isShip
									? 'border-slate-400'
									: 'border-slate-600'}
									{stage === Stage.Placing
									? 'group-hover:border-slate-400 group-active:border-slate-200'
									: ''}"
							/>
						</svelte:element>
					{/each}
				{/each}
			</div>

			<div class="mt-1 area aspect-square grid grid-cols-10">
				{#each player.getGuessBoard() as row, rowIndex}
					{#each row as guess, colIndex}
						{@const location = new Location(rowIndex, colIndex)}
						{@const interactive =
							stage === Stage.Playing && guess === Guess.Empty}

						<svelte:element
							this={interactive ? 'button' : 'div'}
							class="p-1 group grid place-items-center"
							on:click={() => attack(guess, location)}
							on:keypress={() => attack(guess, location)}
						>
							<span
								class="w-6 h-6 rounded-full border-4 transition-colors
									{guess === Guess.Hit
									? 'border-transparent bg-red-500'
									: guess === Guess.Miss
									? 'border-slate-900 bg-white'
									: 'border-slate-600'}
									{interactive
									? 'group-hover:border-slate-400 group-active:border-slate-200'
									: ''}"
							/>
						</svelte:element>
					{/each}
				{/each}
			</div>
		</div>

		<div class="area">
			<div>
				{#each shipsLeft as Ship}
					{@const selected = Ship === CurrentShip}

					<button
						on:click={() => {
							CurrentShip = Ship;
							currentOrientation = Orientation.Horizontal;
							ghostShip = null;
						}}
						class="contents"
					>
						<div
							class="inline-grid
								{selected ? 'cursor-default' : 'cursor-pointer'}"
							style:grid-template-columns="repeat({Ship.LENGTH},
							minmax(0, 1fr));"
						>
							<ShipDisplay
								ship={new Ship(
									new Location(0, 0),
									Orientation.Horizontal
								)}
								ghost={Ship === CurrentShip}
							/>

							{#each { length: Ship.LENGTH } as _, i}
								<div
									class="group p-1 grid place-items-center"
									style:grid-row={1}
									style:grid-column={i + 1}
								>
									<div
										class="w-6 h-6 rounded-full border-4 transition-colors
											{Ship === CurrentShip ? 'border-gray-600' : 'border-slate-400'}"
									/>
								</div>
							{/each}
						</div>
					</button>
				{/each}
			</div>

			<kbd class="bg-black px-0.5 rounded border border-slate-700">
				R
			</kbd>
			rotate
		</div>
	</div>
</div>

<style lang="postcss">
	.area {
		@apply p-4 rounded-xl bg-slate-900 border-2 border-slate-800;
	}
</style>
