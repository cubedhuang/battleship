<script lang="ts">
	import { ComputerPlayer } from '$lib/ComputerPlayer';
	import { Location } from '$lib/Location';

	const player = new ComputerPlayer('Hello');
</script>

<div
	class="min-h-screen grid place-items-center
		bg-black text-white"
>
	<div class="flex flex-col gap-2">
		<h1 class="font-black text-center text-4xl">Battleship</h1>

		<div class="flex gap-2">
			<div class="mt-1 area w-[24rem] aspect-square grid grid-cols-10">
				{#each player.getShips() as ship}
					{@const locations = ship.getLocations()}
					{@const start = locations[0]}
					{@const end = locations[locations.length - 1]}

					<div
						style:grid-row={start.row + 1}
						style:grid-column={start.col + 1}
						style:grid-row-end={ship.isHorizontal()
							? start.row + 1
							: end.row + 2}
						style:grid-column-end={ship.isHorizontal()
							? end.col + 2
							: start.col + 1}
						class="p-0.5"
					>
						<div
							class="w-full h-full rounded-xl bg-slate-500 border-4 border-slate-400"
						/>
					</div>
				{/each}

				{#each { length: 10 } as _, row}
					{#each { length: 10 } as _, col}
						<div
							class="grid place-items-center"
							style:grid-row={row + 1}
							style:grid-column={col + 1}
						>
							{#if player.hasShipAt(new Location(row, col))}
								<span
									class="block w-4 h-4 rounded-full border-4 border-slate-400"
								/>
							{:else}
								<span
									class="block w-4 h-4 rounded-full border-4 border-slate-600"
								/>
							{/if}
						</div>
					{/each}
				{/each}
			</div>

			<div class="mt-1 area w-[24rem] aspect-square grid grid-cols-10">
				{#each Array(100) as _, i}
					<button
						class="group grid place-items-center"
						title={i.toString()}
					>
						<span
							class="w-4 h-4 rounded-full border-4 border-slate-600
								group-hover:border-slate-400 group-active:border-slate-200 transition-colors"
						/>
					</button>
				{/each}
			</div>
		</div>

		<div class="area">other stuff probably</div>
	</div>
</div>

<style lang="postcss">
	.area {
		@apply p-4 rounded-xl bg-slate-900 border-2 border-slate-800;
	}
</style>
