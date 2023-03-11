<script lang="ts">
	import { onMount } from 'svelte';

	import { Comprehension } from '$lib/computers/Comprehension';
	import { HuntAndTargetComputer } from '$lib/computers/HuntAndTargetComputer';
	import { Location } from '$lib/Location';
	import ShipDisplay from '../ShipDisplay.svelte';

	let first = new Comprehension();
	let second = new HuntAndTargetComputer();

	let turn = 0;
	let firstAttacks = 0;
	let secondAttacks = 0;
	let firstScore = 0;
	let secondScore = 0;

	let id: number;

	function attack(location: Location) {
		if (turn % 2 === 0) {
			first.attack(second, location);
			firstAttacks++;
		} else {
			second.attack(first, location);
			secondAttacks++;
		}

		turn++;

		first = first;
		second = second;
	}

	function reset() {
		first = new Comprehension();
		second = new HuntAndTargetComputer();

		turn = Math.random() > 0.5 ? 1 : 0;
		firstAttacks = 0;
		secondAttacks = 0;

		first = first;
		second = second;

		id = startGame();
	}

	function move() {
		if (first.isDead() || second.isDead()) {
			clearInterval(id);

			if (first.isDead()) {
				secondScore++;
			} else {
				firstScore++;
			}

			id = setTimeout(() => reset(), 200);

			return true;
		}

		attack(new Location(0, 0));

		return false;
	}

	function startGame() {
		const currentId = setInterval(() => {
			move();

			first = first;
			second = second;
		}, 100);

		return currentId;
	}

	onMount(() => {
		id = startGame();

		return () => clearInterval(id);
	});
</script>

<div class="min-h-screen py-20 grid place-items-center">
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h1 class="font-black text-center text-4xl">Testing Arena</h1>

			<a href="/about" class="px-4 py-2 interactive font-bold">Back</a>
		</div>

		<div class="flex gap-2">
			<div class="area">
				<div class="flex gap-4 font-bold text-center">
					<h1>Comprehension</h1>

					<p class="ml-auto">Turn {firstAttacks}</p>
					<p>{firstScore}</p>
				</div>

				<div class="mt-2 grid grid-cols-10">
					{#each first.getShips() as ship}
						<ShipDisplay {ship} />
					{/each}

					{#each first.getGuessBoard() as _, row}
						{#each first.getGuessBoard() as _, col}
							{@const location = new Location(row, col)}
							{@const isHit = first.wasHitAt(location)}
							{@const isShip = first.hasShipAt(location)}

							<div
								class="group p-1 grid place-items-center"
								style:grid-row={row + 1}
								style:grid-column={col + 1}
							>
								<div
									class="w-6 h-6 rounded-full border-4 transition-colors
										{isHit && isShip
										? 'border-transparent bg-red-500'
										: isHit
										? 'border-slate-900 bg-white'
										: isShip
										? 'border-slate-400'
										: 'border-slate-600'}"
								/>
							</div>
						{/each}
					{/each}
				</div>
			</div>

			<div class="area">
				<div class="flex gap-4 font-bold text-center">
					<h1>HuntAndTarget</h1>

					<p class="ml-auto">Turn {secondAttacks}</p>
					<p>{secondScore}</p>
				</div>

				<div class="mt-2 grid grid-cols-10">
					{#each second.getShips() as ship}
						<ShipDisplay {ship} />
					{/each}

					{#each second.getGuessBoard() as _, row}
						{#each second.getGuessBoard() as _, col}
							{@const location = new Location(row, col)}
							{@const isHit = second.wasHitAt(location)}
							{@const isShip = second.hasShipAt(location)}

							<div
								class="group p-1 grid place-items-center"
								style:grid-row={row + 1}
								style:grid-column={col + 1}
							>
								<div
									class="w-6 h-6 rounded-full border-4 transition-colors
										{isHit && isShip
										? 'border-transparent bg-red-500'
										: isHit
										? 'border-slate-900 bg-white'
										: isShip
										? 'border-slate-400'
										: 'border-slate-600'}"
								/>
							</div>
						{/each}
					{/each}
				</div>
			</div>
		</div>

		<div class="area flex gap-2">
			<div class="grid grid-cols-10 rounded-xl overflow-hidden">
				{#each first.getUnknownHeatMap() as row}
					{#each row as guess}
						<div
							class="w-4 h-4"
							style:background-color={`hsl(${
								guess * 5
							}, 100%, 50%)`}
						/>
					{/each}
				{/each}
			</div>

			<div class="grid grid-cols-10 rounded-xl overflow-hidden">
				{#each first.getHitsHeatMap() as row}
					{#each row as guess}
						<div
							class="w-4 h-4"
							style:background-color={`hsl(${
								guess * 20
							}, 100%, 50%)`}
						/>
					{/each}
				{/each}
			</div>

			<div class="ml-2">
				<h2 class="font-bold">Ships Might Be Left</h2>

				<ul class="flex gap-2">
					{#each first.getShipsLeft() as ship}
						<li>{ship}</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>
