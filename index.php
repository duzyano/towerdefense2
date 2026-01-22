<!DOCTYPE html>
<html lang="nl">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Tower Defense 2 - Enemy Movement</title>
	<link rel="stylesheet" href="enemy_movement/style.css">
</head>

<body>
	<div class="game-container">
		<canvas id="game" width="800" height="480"></canvas>
	</div>
	<style>
		html,
		body {
			height: 100%;
		}

		body {
			margin: 0;
			background: #0f1220;
			display: grid;
		}

		.game-container {
			display: grid;
			place-items: center;
			min-height: 100vh;
		}

		#game {
			display: block;
			background: #1116;
			border: 1px solid #333;
			border-radius: 8px;
		}
	</style>
	<a href="/game_core/demo.html" style="display:inline-block; padding:10px 14px; border-radius:8px; background:#4f8cff; color:#fff; text-decoration:none; font-weight:600;">Open Enemies & Waves Demo</a>
	</p>
	<script src="enemy_movement/enemy.js"></script>
	<canvas id="game" width="1280" height="720"></canvas>

	<script>
		// Maak canvas fullscreen
		(function() {
			const canvas = document.getElementById('game');
			const ctx = canvas.getContext('2d');

			function resize() {
				const dpr = Math.max(1, window.devicePixelRatio || 1);
				const w = window.innerWidth;
				const h = window.innerHeight;
				canvas.style.width = w + 'px';
				canvas.style.height = h + 'px';
				canvas.width = Math.floor(w * dpr);
				canvas.height = Math.floor(h * dpr);
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			}
			window.addEventListener('resize', resize);
			resize();
		})();
	</script>
	<script src="enemy_movement/enemy.js"></script>