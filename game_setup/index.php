<!DOCTYPE html>
<html lang="nl">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>TowerDefense • Startscherm</title>
	<link rel="stylesheet" href="styles.css" />
</head>

<body>
	<main class="screen">
		<section class="brand">
			<h1 class="title">TowerDefense</h1>
			<p class="subtitle">Start, instellingen en uitleg</p>
		</section>

		<nav class="menu">
			<button class="btn primary" id="btn-start">Start spel</button>
			<button class="btn" id="btn-settings">Instellingen</button>
			<button class="btn" id="btn-howto">Uitleg</button>
			<button class="btn" id="btn-credits">Credits</button>
		</nav>

		<footer class="footer">
			<span></span>
		</footer>
	</main>

	<dialog class="modal" id="settings-modal">
		<form method="dialog" class="settings-form">
			<header>
				<h2>Instellingen</h2>
			</header>

			<div class="grid">
				<label>
					Moeilijkheid
					<select id="difficulty">
						<option value="easy">Makkelijk</option>
						<option value="normal" selected>Normaal</option>
						<option value="hard">Moeilijk</option>
					</select>
				</label>

				<label>
					Kaart
					<select id="map">
						<option value="forest" selected>Bos</option>
						<option value="desert">Woestijn</option>
						<option value="snow">Sneeuw</option>
					</select>
				</label>

				<label>
					Muziekvolume
					<input type="range" id="musicVolume" min="0" max="100" value="60" />
				</label>

				<label>
					Effectvolume
					<input type="range" id="sfxVolume" min="0" max="100" value="80" />
				</label>

				<label>
					Beeldkwaliteit
					<select id="graphicsQuality">
						<option value="low">Laag</option>
						<option value="medium" selected>Middel</option>
						<option value="high">Hoog</option>
					</select>
				</label>

				<label class="row">
					Volledig scherm
					<input type="checkbox" id="fullscreen" />
				</label>

				<label>
					Taal
					<select id="language">
						<option value="nl" selected>Nederlands</option>
						<option value="en">Engels</option>
					</select>
				</label>

				<label>
					Spelsnelheid
					<input type="range" id="gameSpeed" min="1" max="3" value="1" step="0.5" />
				</label>
			</div>

			<menu class="actions">
				<button class="btn" id="btn-cancel" value="cancel">Sluiten</button>
				<button class="btn primary" id="btn-save" value="default">Opslaan</button>
			</menu>
		</form>
	</dialog>


	<dialog class="modal" id="howto-modal">
		<article>
			<header>
				<h2>Uitleg</h2>
			</header>
			<p>
				Dit is het start- en instellingen-scherm voor TowerDefense 2.
				Kies je voorkeuren via Instellingen en druk op "Start spel".

			</p>
			<menu class="actions">
				<button class="btn" id="btn-howto-close">Sluiten</button>
			</menu>
		</article>
	</dialog>

	<dialog class="modal" id="credits-modal">
		<article>
			<header>
				<h2>Credits</h2>
			</header>
			<p>Gemaakt door duzyano en Tobias.</p>
			<menu class="actions">
				<button class="btn" id="btn-credits-close">Sluiten</button>
			</menu>
		</article>
	</dialog>

	<script type="module" src="main.js"></script>
</body>

</html>