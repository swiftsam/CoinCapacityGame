<?php

/*
	This program acts as the go between the front-end browser code in Javascript and the SQL database.
	It is called via an AJAX interface with the following parameters :-'
		'source' - the main data source to be accessed
		'action' - the type of operation to be performed.
	There can be other paramaters depending on the source and action being carried out.
	Return value is a JSON endoded array, typically containing dataset results.
*/


session_start();

// local test environment
//date_default_timezone_set("Europe/Dublin");
//$Connection = new mysqli("localhost", "root", "", "ccg");

// live environment
date_default_timezone_set("America/Raleigh");
$Connection = new mysqli("localhost", "ccg", "QrMKBUPLX4wVqY8z", "ccg");

$Return = array();
switch($_GET['source'])
{
	case "CONFIG":
		$Qres = $Connection->query("SELECT * from config LIMIT 1");
		$Return = $Qres->fetch_assoc();
		$TotalRounds = ($Return['Blocks'] * $Return['Rounds']);

		// set random sequence
		$User = $_SESSION['user'];
		for($Round=1; $Round<=$TotalRounds; $Round++)
		{
			$Qres = $Connection->query("SELECT * from sequence WHERE UserID='$User' AND Round=$Round LIMIT 1");
			if($Qres->num_rows == 0)
			{
				$RandCoins = mt_rand(1,9);
				$Connection->query("INSERT INTO sequence(UserID,Round,Coins) VALUES('$User',$Round,$RandCoins)"); 
			}
		}
		break;

	case "USER":
		switch($_GET['action'])
		{
			case "GET":
				$ID = $_GET['id'];
				$Qres = $Connection->query("SELECT * from users WHERE ID='$ID' LIMIT 1");
				if($Qres->num_rows > 0)
				{				
					$_SESSION['user'] = $ID;
					$Return = $Qres->fetch_assoc();
					if(substr($Return['FirstActivity'],0,1) == '0')
						$Connection->query("UPDATE users SET FirstActivity=now() WHERE ID='$ID' LIMIT 1");
				}
				break;
			case "SET":
				$ID = $_SESSION['user'];
				$IP = $_SERVER["REMOTE_ADDR"];
				$SCR = $_GET['scr'];
				$Connection->query("UPDATE users SET IP='$IP', LastActivity=now(), LastScreen='$SCR' WHERE ID='$ID' LIMIT 1");
				break;
		}
		break;

	case "LOG":
		$User = $_SESSION['user'];
		$P1 = $_GET['p1'];
		$P2 = $_GET['p2'];
		$P3 = $_GET['p3'];
		$P4 = $_GET['p4'];
		$P5 = $_GET['p5'];
		switch($_GET['action'])
		{
			case "BLOCK":
				$Connection->query("INSERT INTO log_block(UserID,Block,Size,Submitted) VALUES('$User',$P1,$P2,now())"); 
				break;
			case "ROUND":
				$Connection->query("INSERT INTO log_round(UserID,Block,Round,CoinsAvail,CoinsColl,Submitted) VALUES('$User',$P1,$P2,$P3,$P4,now())"); 
				break;
			case "SURVEY":
				$Connection->query("INSERT INTO log_survey(UserID,Block,Question,Answer,Submitted) VALUES('$User',$P5,'$P1',$P2,now())"); 
				$Connection->query("INSERT INTO log_survey(UserID,Block,Question,Answer,Submitted) VALUES('$User',$P5,'$P3',$P4,now())"); 
				break;
		}
		break;

	case "SEQ":
		$User = $_SESSION['user'];
		$Round = $_GET['action'];
		$Qres = $Connection->query("SELECT * from sequence WHERE UserID='$User' AND Round=$Round LIMIT 1");
		$Return = $Qres->fetch_assoc();
		break;

	case "ADMIN":
		switch($_GET['action'])
		{
			case "LOGS":
				// empty session log files
				$Connection->query("DELETE FROM log_block");
				$Connection->query("DELETE FROM log_round");
				$Connection->query("DELETE FROM log_survey");
				break;
			case "SCR":
				$Connection->query("UPDATE users SET LastScreen='INTRO', LastActivity=now()");
				break;
		}
		break;
}

$Connection->close();

echo json_encode($Return, JSON_NUMERIC_CHECK);
exit;

?>
