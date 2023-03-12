<main class="max-w-prose mx-auto py-20">
	<a href="/">Back</a>

	<h1>About</h1>

	<p class="flex gap-4">
		<a href="/arena">Computer Arena</a>
		<a href="/testing">Arrangement Testing</a>
		<a
			href="https://github.com/cubedhuang/battleship"
			target="_blank"
			rel="noopener noreferrer"
		>
			Source Code
		</a>
	</p>

	<p>
		This is a battleship game I made for a project in my
		<em>AP Computer Science A</em> class.
	</p>

	<p>
		The computer is given less information than the player. In standard
		battleship, when a ship is sunk, the player must announce that a ship
		was sunk but is not required to announce which ship. The computer is
		given exactly that information whenever it tries a shot &ndash; whether
		a shot hits, misses, or sinks some ship. The player has more information
		because you can see exactly which ship and its locations after you sink
		it.
	</p>
</main>

<style lang="postcss">
	h1 {
		@apply my-8 text-3xl font-black;
	}

	p {
		@apply my-4;
	}

	a {
		@apply relative inline-block text-blue-400 font-semibold
			before:absolute before:top-full before:inset-x-0 before:h-0.5 before:-z-10
			before:bg-blue-400 before:rounded-lg
			before:opacity-0 hover:before:opacity-100 before:transition-opacity;
	}
</style>
