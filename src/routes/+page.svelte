<script lang="ts">
	import { ComputerPlayer } from '$lib/ComputerPlayer';
	// import { HumanPlayer } from '$lib/HumanPlayer';
	import { Location } from '$lib/Location';

	let player = new ComputerPlayer('Hello');
</script>

<div
	class="min-h-screen grid place-items-center
		bg-black text-white"
>
	<div class="flex flex-col gap-2">
		<h1 class="font-black text-center text-4xl">Battleship</h1>

		<div class="flex gap-2">
			<div class="mt-1 area aspect-square grid grid-cols-10">
				{#each player.getShips() as ship}
					{@const locations = ship.getLocations()}
					{@const start = locations[0]}
					{@const end = locations[locations.length - 1]}
					{@const isSunk = ship.isSunk()}

					<div
						style:grid-row={start.row + 1}
						style:grid-column={start.col + 1}
						style:grid-row-end={ship.isHorizontal()
							? start.row + 1
							: end.row + 2}
						style:grid-column-end={ship.isHorizontal()
							? end.col + 2
							: start.col + 1}
						class="p-1"
					>
						<div
							class="w-full h-full rounded-xl border-4 transition-colors
								{isSunk ? 'bg-red-400 border-red-300' : 'bg-slate-500 border-slate-400'}"
						/>
					</div>
				{/each}

				{#each player.getGuessBoard() as _, row}
					{#each player.getGuessBoard() as _, col}
						{@const location = new Location(row, col)}
						{@const isHit = player.wasHitAt(location)}
						{@const isShip = player.hasShipAt(location)}

						<div
							class="p-1 grid place-items-center"
							style:grid-row={row + 1}
							style:grid-column={col + 1}
						>
							<div
								class="w-6 h-6 rounded-full border-4 transition-colors
									{isHit && isShip
									? 'border-transparent bg-red-500'
									: isHit
									? 'border-red-500'
									: isShip
									? 'border-slate-400'
									: 'border-slate-600'}"
							/>
						</div>
					{/each}
				{/each}
			</div>

			<div class="mt-1 area aspect-square grid grid-cols-10">
				{#each player.getGuessBoard() as row}
					{#each row as guess}
						<button
							class="p-1 group grid place-items-center"
							on:click={() => {
								player.attack(player, new Location(0, 0));
								player = player;
							}}
						>
							<span
								class="w-6 h-6 rounded-full border-4 border-slate-600 transition-colors
									group-hover:border-slate-400 group-active:border-slate-200"
							/>
						</button>
					{/each}
				{/each}
			</div>
		</div>

		<div class="area flex">ship</div>
	</div>
</div>

<style lang="postcss">
	.area {
		@apply p-4 rounded-xl bg-slate-900 border-2 border-slate-800;
	}
</style>
