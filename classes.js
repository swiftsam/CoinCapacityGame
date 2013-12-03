//-----
// Configuration data 
//-----
function ConfigData()
{
	this.AdminUser;
	this.LoggedUser;
	this.CurrentScreen;
	this.LastActivity;
	this.Blocks;
	this.Rounds;
	this.Sizes;
	this.Prices;
	this.AnimateCoinInterval;
	this.AnimateCoinSpeed;
	this.AnimateCoinFade;
}


//-----
// Coin totals
//-----
function Coins()
{
	this.CurrentRound=1;
	this.Possible=0;
	this.Collected=0;
	this.Lost=0;
	this.Spent=0;
	this.Bank;
}


//-----
// Block data
//-----
function Block()
{
	this.Num;
	this.Size;
	this.Cost;
}


//-----
// Coin image display
//-----
function GetCoins()
{
	this.Possible;
	this.Shown;
	this.SetPossible = SetPossible;
	this.ShowCoinCollected = ShowCoinCollected;
	this.ShowCoinLost = ShowCoinLost;
	this.GhostCoin = GhostCoin;
	this.CoinImage = "img src='../images/coin.png' height='40' ";

	function SetPossible(Round)
	{
		$("#coins_lost").html('');
		$("#coins_coll").html('');

		this.Shown = 0;
		//this.Possible = Math.floor((Math.random()*9)+1);

		GetSeq = 0;
		$.getJSON("data.php", {source:"SEQ",action:Round}, 
		function(Data)
		{
			GetSeq = Data.Coins;
		});
		this.Possible = GetSeq;
	}
	function ShowCoinCollected()
	{
		$('#coins_coll').append("<"+this.CoinImage+" id='coin"+this.Shown+"'>");
		this.Shown++;
	}
	function ShowCoinLost()
	{
		$('#coins_lost').append("<"+this.CoinImage+" id='coin"+this.Shown+"'>");
		this.Shown++;
	}
	function GhostCoin()
	{
		$('#coins_coll').prepend("<"+this.CoinImage+"style='visibility:hidden;'>");
		this.Shown++;		
	}
}
