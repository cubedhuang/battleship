<script lang="ts">
	import { onMount } from 'svelte';

	import { Eckspurt, SeaState } from '$lib/computers/Eckspurt';
	import { HumanPlayer } from '$lib/HumanPlayer';
	import { Location } from '$lib/Location';
	import { Carrier, Orientation, Ship, SHIPS } from '$lib/Ship';

	import ShipDisplay from '../ShipDisplay.svelte';

	const ComputerType = Eckspurt;

	enum Stage {
		Placing,
		Playing,
		Ended
	}

	let stage = Stage.Placing;

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

		if (ghostShip && human.canPlaceShip(ghostShip)) {
			human.addShip(ghostShip);

			ghostShip = null;
			shipsLeft = shipsLeft.filter(ship => ship !== CurrentShip);

			if (shipsLeft.length > 0) {
				CurrentShip = shipsLeft[0];

				shipsLeft = shipsLeft;
			} else {
				stage = Stage.Playing;
			}

			currentOrientation = Orientation.Horizontal;
		}

		human = human;
	}

	function normalizeHeatMap(heatMap: readonly number[][]) {
		const max = Math.max(
			...heatMap.flatMap(row =>
				row ? row.map(value => Math.abs(value)) : []
			)
		);

		return heatMap.map(row =>
			row ? row.map(value => (value / max) * 100) : []
		);
	}

	let human = new HumanPlayer();
	let computer = new ComputerType();

	let id: number;

	onMount(() => {
		id = setInterval(() => {
			if (stage !== Stage.Playing) return;

			computer.attack(human, new Location(0, 0));

			if (human.isDead()) stage = Stage.Ended;

			human = human;
			computer = computer;
		}, 200);

		return () => clearInterval(id);
	});
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

<div class="max-w-screen-xl mx-auto px-4 py-20">
	<div class="flex items-center justify-between">
		<h1 class="font-black text-center text-4xl">Arrangement Testing</h1>

		<a href="/about" class="px-4 py-2 interactive font-bold">Back</a>
	</div>

	<div class="mt-4 flex gap-2 items-start">
		<div class="shrink-0 area aspect-square grid grid-cols-10">
			{#if stage === Stage.Placing && ghostShip}
				<ShipDisplay
					ship={ghostShip}
					ghost
					valid={human.canPlaceShip(ghostShip)}
				/>
			{/if}

			{#each human.getShips() as ship}
				<ShipDisplay {ship} />
			{/each}

			{#each human.getGuessBoard() as _, row}
				{#each human.getGuessBoard() as _, col}
					{@const location = new Location(row, col)}
					{@const isHit = human.wasHitAt(location)}
					{@const isShip = human.hasShipAt(location)}

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

		<div class="flex-1 flex flex-col gap-2">
			{#if stage === Stage.Placing}
				<div class="area">
					<p class="font-bold">
						<kbd
							class="bg-black px-1 rounded border border-slate-700"
						>
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

			<div class="area flex gap-2">
				<div class="grid grid-cols-10 rounded-xl overflow-hidden">
					{#each normalizeHeatMap(computer.offense.getLastHeatMap()) as row}
						{#each row as guess}
							<div
								class="w-4 h-4"
								style:background-color={`hsl(${
									guess * 1
								}, 100%, 50%)`}
							/>
						{/each}
					{/each}
				</div>

				<div class="grid grid-cols-10 rounded-xl overflow-hidden">
					{#each computer.offense.getGameState() as row}
						{#each row as guess}
							<div
								class="w-4 h-4
								{guess === SeaState.Unknown
									? 'bg-slate-600'
									: guess === SeaState.Miss
									? 'bg-slate-800'
									: guess === SeaState.Hit
									? 'bg-red-500'
									: 'bg-green-500'}"
							/>
						{/each}
					{/each}
				</div>

				<div class="ml-2">
					<h2 class="font-bold">Potential Ships Left</h2>

					<ul class="flex gap-2">
						{#each computer.offense.getShipsLeft() as ship}
							<li>{ship}</li>
						{/each}
					</ul>
				</div>
			</div>

			{#if stage === Stage.Ended}
				<div class="area flex items-center justify-between">
					<h1 class="font-bold text-2xl">Game Over</h1>

					<button
						class="px-4 py-2 interactive"
						on:click={() => {
							stage = Stage.Placing;

							human = new HumanPlayer();
							computer = new ComputerType();

							shipsLeft = [...SHIPS];
							CurrentShip = shipsLeft[0];
							currentOrientation = Orientation.Horizontal;
							ghostShip = null;
						}}
					>
						Restart
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
