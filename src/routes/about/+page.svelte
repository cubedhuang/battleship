<main class="max-w-prose mx-auto py-20">
	<a href="/">Back</a>

	<h1>About</h1>

	<p class="flex gap-4">
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
