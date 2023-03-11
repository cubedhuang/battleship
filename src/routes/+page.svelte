<script lang="ts">
	import { fly } from 'svelte/transition';

	import { CellState } from '$lib/CellState';
	import { HumanPlayer } from '$lib/HumanPlayer';
	import { Comprehension } from '$lib/Comprehension';
	import { Location } from '$lib/Location';
	import { Carrier, Orientation, Ship, SHIPS } from '$lib/Ship';

	import ShipDisplay from './ShipDisplay.svelte';
	import { onMount } from 'svelte';

	const ComputerType = Comprehension;

	enum Stage {
		Placing,
		Playing,
		Ended
	}

	let stage = Stage.Placing;
	let winner = null;
	let notified = false;

	let shipsLeft = [...SHIPS];
	let CurrentShip: new (start: Location, orientation: Orientation) => Ship =
		Carrier;
	let currentOrientation = Orientation.Horizontal;
	let ghostShip: Ship | null = null;

	function hoverShip(location: Location | null) {
		if (stage !== Stage.Placing) return;

		ghostShip = location && new CurrentShip(location, currentOrientation);
	}

	function placeShip(location: Location) {
		if (stage !== Stage.Placing) return;

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
	let computer = new ComputerType();

	function attack(guess: CellState, location: Location) {
		if (stage !== Stage.Playing || guess !== CellState.Empty) {
			return;
		}

		player.attack(computer, location);

		if (computer.isDead()) {
			winner = player;
			stage = Stage.Ended;

			player = player;
			computer = computer;

			return;
		}

		if (computer.getShip(location)?.isSunk()) {
			notified = true;

			setTimeout(() => {
				notified = false;
			}, 3000);
		}

		computer.attack(player, new Location(0, 0));

		if (player.isDead()) {
			winner = computer;
			stage = Stage.Ended;

			player = player;
			computer = computer;

			return;
		}

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

<svelte:head>
	<title>Battleship</title>
</svelte:head>

<div class="min-h-screen grid place-items-center">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h1 class="font-black text-center text-4xl">Battleship</h1>

			<a href="/about" class="px-4 py-2 interactive font-bold">About</a>
		</div>

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

						<button
							class="group p-1 grid place-items-center"
							disabled={stage !== Stage.Placing || isShip}
							style:grid-row={row + 1}
							style:grid-column={col + 1}
							on:mouseover={() => hoverShip(location)}
							on:focus={() => hoverShip(location)}
							on:mouseleave={() => hoverShip(null)}
							on:blur={() => hoverShip(null)}
							on:click={() => placeShip(location)}
							on:keypress|preventDefault
						>
							<div
								class="w-6 h-6 rounded-full border-4 transition-colors
									{isHit && isShip
									? 'border-transparent bg-red-500'
									: isHit
									? 'border-slate-900 bg-white'
									: isShip
									? 'border-slate-400'
									: 'border-slate-600'}
									{stage === Stage.Placing
									? 'group-hover:border-slate-400 group-active:border-slate-200'
									: ''}"
							/>
						</button>
					{/each}
				{/each}
			</div>

			<div class="mt-1 area aspect-square grid grid-cols-10">
				{#if stage === Stage.Ended}
					{#each computer.getShips() as ship}
						<ShipDisplay {ship} />
					{/each}
				{/if}

				{#each player.getGuessBoard() as row, rowIndex (rowIndex)}
					{#each row as guess, colIndex (colIndex)}
						{@const location = new Location(rowIndex, colIndex)}
						{@const interactive =
							stage === Stage.Playing &&
							guess === CellState.Empty}

						<button
							disabled={!interactive}
							class="p-1 group grid place-items-center"
							style:grid-row={rowIndex + 1}
							style:grid-column={colIndex + 1}
							on:click={() => attack(guess, location)}
							on:keypress={() => attack(guess, location)}
						>
							<span
								class="w-6 h-6 rounded-full border-4 transition-colors
									{guess === CellState.Hit
									? 'border-transparent bg-red-500'
									: guess === CellState.Miss
									? 'border-slate-900 bg-white'
									: 'border-slate-600'}
									{interactive
									? 'group-hover:border-slate-400 group-active:border-slate-200'
									: ''}"
							/>
						</button>
					{/each}
				{/each}
			</div>
		</div>

		{#if stage === Stage.Placing}
			<div class="area">
				<p class="font-bold">
					<kbd class="bg-black px-1 rounded border border-slate-700">
						R
					</kbd>
					rotate
				</p>

				<div class="mt-2 flex flex-wrap">
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
								class="grid
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
			</div>
		{/if}

		{#if stage === Stage.Ended}
			<div class="area flex items-center justify-between">
				<h1 class="font-bold text-2xl">
					{#if player.isDead()}
						You lost...
					{:else}
						You won!
					{/if}
				</h1>

				<button
					class="px-4 py-2 interactive"
					on:click={() => {
						stage = Stage.Placing;
						winner = null;

						player = new HumanPlayer();
						computer = new ComputerType();

						shipsLeft = [...SHIPS];
						CurrentShip = shipsLeft[0];
						currentOrientation = Orientation.Horizontal;
						ghostShip = null;
					}}
				>
					Play Again
				</button>
			</div>
		{/if}
	</div>
</div>

{#if notified}
	<div
		class="fixed bottom-2 right-2 area text-white"
		transition:fly={{ y: 4 }}
	>
		You sunk my battleship!
	</div>
{/if}
