<?php
// Zorg dat het startscherm als eerste verschijnt
$target = 'game_setup/index.php';
// Probeer header redirect
if (!headers_sent()) {
    header('Location: ' . $target);
    exit;
}
// Fallback voor het geval headers al verzonden zijn
?>
<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=game_setup/index.php" />
    <title>Doorsturen…</title>
    <script>location.href='game_setup/index.php';</script>
  </head>
  <body>
    <p>Doorsturen naar startscherm… <a href="game_setup/index.php">Klik hier als het niet automatisch gaat</a>.</p>
  </body>
</html>