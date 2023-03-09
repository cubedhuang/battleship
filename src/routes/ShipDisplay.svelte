<script lang="ts">
	import type { Ship } from '$lib/Ship';

	export let ship: Ship;
	export let ghost = false;
	export let valid = true;

	$: locations = ship.getLocations();
	$: start = locations[0];
	$: end = locations[locations.length - 1];
	$: isSunk = ship.isSunk();
</script>

<div
	style:grid-row={start.row + 1}
	style:grid-column={start.col + 1}
	style:grid-row-end={ship.isHorizontal() ? start.row + 1 : end.row + 2}
	style:grid-column-end={ship.isHorizontal() ? end.col + 2 : start.col + 1}
	class="p-1 {ghost ? 'opacity-50 pointer-events-none' : ''}"
>
	<div
		class="w-full h-full rounded-xl border-4 transition-colors
			{isSunk || !valid
			? 'bg-red-400 border-red-300'
			: 'bg-slate-500 border-slate-400'}"
	/>
</div>
