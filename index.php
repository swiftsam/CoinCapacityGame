<!DOCTYPE HTML>
<html lang="en">
<?php
	session_start();
?>



<!-- ****** -->
<!-- HEADER -->
<!-- ****** -->
<head>
	<meta charset="UTF-8">
	<meta name="description" content="Coin Collection Game">
	<meta name="author" content="Martin J Gibbs">
	<title>Coin Collector Game</title>
		
	<script type="text/javascript" src="../jQuery/js/main.js"></script>
	<script type="text/javascript" src="../jQuery/js/ui.js"></script>
	<link type="text/css" href="../jQuery/css/start/min.css" rel="stylesheet" />
		
	<script type="text/javascript" src="classes.js"></script>
	<script type="text/javascript" src="main.js"></script>
	<link type="text/css" href="main.css" rel="stylesheet"/>

	<link rel="shortcut icon" href="../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../images/favicon.ico" type="image/x-icon">
</head>



<!-- ******* -->
<!-- USER ID -->
<!-- ******* -->
<?php
	echo '<div class="dialog" id="get_login">';
	echo '<p align="center">User ID <input type="text" id="user" class="user" size="10"';
	if(isset($_GET['userID']))
		echo ' value="'.$_GET['userID'].'"';
	echo '/></p></div>';
?>


<!-- **** -->
<!-- BODY -->
<!-- **** -->
<body>
	<p id="header_text"></p>


	<!-- game intro page -->
	<div id="intro">
		<h1>Welcome to the Coin Collecting Game</h1>
		<h2>In this game, your goal is to finish the game with as many coins as you can.</h2>
		<h2>The number of coins you can collect is determined by the size of the collector you have.</h2>
		<h2>
			This game will last <span class="total_rounds"></span> rounds.
			After every <span class='rounds'></span> rounds you will decide how large of a collector you want to buy for the following rounds.
		</h2>
		<br>
		<div id="logged_no" align="center">
			<h2>You are required to login with a valid user id to play</h2>
			<button id='btn-login'>Login</button>
		</div>
		<div id="logged_yes" align="center">
			<h2>Are you ready to begin?</h2>
			<button id='btn-begin'>Begin</button>
		</div>
		<br>
	</div>


	<!-- coin totals -->
	<div id="coin_tots">
		<table width="98%" align="center">
			<tr>
				<td><div class="this_round"><b>This Round:</b></div></td>
				<td align="right"><b>Round <span id="curr_round"></span> of <span class="total_rounds"></span></b></td>
			</tr>
			<tr>
				<td><div class="this_round">Coins possible = <span id='coins_poss_this'></div></td>
				<td id="tcp" align="right">Total coins possible = <span id='coins_poss_tot'></span></td>
			</tr>
			<tr>
				<td><div class="this_round">Coins collected = <span id='coins_coll_this'></span></div></td>
				<td id="tcc" align="right">Total coins collected = <span id='coins_coll_tot'></span></td>
			</tr>
			<tr>
				<td><div class="this_round">Coins lost = <span id='coins_lost_this'></span></div></td>
				<td id="tcl" align="right">Total coins lost = <span id='coins_lost_tot'></span></td>
			</tr>
			<tr>
				<td></td>
				<td id="cs" align="right">Coins spent = <span id='coins_spent_tot'></span></td>
			</tr>
			<tr>
				<td></td>
				<td align="right">Coins in bank = <span id='coins_bank_tot'></span></td>
			</tr>
		</table>
	</div>


	<!-- collector size select -->
	<div id="select_collect">
		<h2>
			Please choose a coin collector from the choices below. 
			Larger collectors cost more and can collect more coins per round.
			The collector you choose now will last only <span class='rounds'></span> rounds after which you will have to choose again. 
		</h2>

		<table class="collectors" id="buy_collectors" align="center"> <!-- contents dynamic & populated via javascript -->
		</table>

		<br>

		<div align="center">
			<button id='btn-buy'>Buy collector and start</button>
		</div>
		<br>
	</div>


	<!-- round start / coins appear -->
	<div id="round_start">
			<table align='right' id="coin_drop" border=0> 
				<tr>
					<td id="coins_lost"></td>
					<td id="coins_coll"></td>
					<td id="coins_move"></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td id='piggy'></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td align="center" ><button id='btn-bank'>Bank</button></td>
				</tr>
			</table>
			<br><br>		
		
		
		<table class="collectors" id="bought_collectors" align="center"> <!-- contents dynamic & populated via javascript -->
		</table>
	</div>


	<!-- next round -->
	<p align="center"><button id='btn-next'>Continue to next round</button></p>


	<!-- post block survey -->
	<div id="survey1">
		<br><br>
		<table width="95%" align="center">
			<tr><td colspan='3'><h2>What was the average number of coins possible per round over the last <span class='rounds'></span> rounds?</h2></td></tr>
			<tr><td width="5px">0</td><td class="slider" id="slider-pbs1"></td><td width="5px">9</td></tr>
		</table>
		
		<br><br>
		<table width="95%" align="center">
			<tr><td colspan="3"><h2>What was the average number of coins possible per round since the beginning of the game?</h2></td></tr>
			<tr><td width="5px">0</td><td class="slider" id="slider-pbs2"></td><td width="5px">9</td></tr>
		</table>
		
		<br><br><br>
		<div align='center'>
			<button id='btn-pbs'>Save & Continue</button>
		</div>
		<br>
	</div>


	<!-- post game survey -->
	<div id="survey2" align="center">
		<br><br>
		<table width="90%" align="center" >
			<tr><td colspan='3'><h2>How many times was your collector too small for the coins that appeared</h2></td></tr>
			<tr><td width="5px">0</td><td class="slider" id="slider-pgs1"></td><td width="5px">100</td></tr>
		</table>
		
		<br><br>
		<table width="90%" align="center" >
			<tr><td colspan='3'><h2>If you had to play again now and pick one collector for all rounds, what size would you pick?</h2> </td></tr>
			<tr><td width="5px">0</td><td class="slider" id="slider-pgs2"></td><td width="5px">9</td></tr>
		</table>
		
		<br><br><br>
		<div align='center'>
			<button id='btn-pgs'>Save & Exit</button>
		</div>
		<br>
	</div>


	<!-- admin options -->
	<div id="admin" align="center">
		Optional administrator functions
	</div>


	<!-- credits -->
	<div id="credits" align="center">
		<br><br><b>Concept & Design</b>
		<br>Dr Sam Swift
		<br>Dr Adrian Camilleri

		<br><br><b>Programming</b>
		<br>Martin Gibbs
		<br><br>
	</div>

</body>

</html>