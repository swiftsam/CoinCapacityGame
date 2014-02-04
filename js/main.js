// global object defintions (defined in classes.js)
var GameConfig = new ConfigData();
var CoinTots = new Coins();
var CoinRound = new Coins();
var CurrentBlock = new Block();


//
// PROJECT START - called on form load
//
$(document).ready(function()
{
	// slow client/server processing means forced sync processing on all ajax calls.
	$.ajaxSetup({async: false});


	// ensure all screens are hidden to begin with
	HideScreens();


	// button defintions
	//$("button").button();
	//$("#btn-login").click(function(){UserLogin()});
	$("#btn-agree").click(function(){UserConsent()});
	$("#btn-begin").click(function(){GameStart()});
	$("#btn-buy").click(function(){BuyCollector()});
	$("#btn-next").click(function(){NextRound()});
	$("#btn-pbs").click(function(){PBS()});
	$("#btn-pgs").click(function(){PGS()});
	$("#btn-bank").click(function(){BankCoins()});


	// create slider value displays
   $("#pbs-1").slider({
   	min: 0,
   	max: 10,
   	step: .1,
   	value: 0,
   	slide: function(event, ui) {
   		$("#pbs-1>a").html(ui.value);
   	}
   });
   $("#pbs-2").slider({
   	min: 0,
   	max: 10,
   	step: .1,
   	value: 0,
   	slide: function(event, ui) {
   		$("#pbs-2>a").html(ui.value);
   	}
   });
   $("#pgs-1").slider({
   	min: 1,
   	max: 100,
   	step: 1,
   	value: 0,
   	slide: function(event, ui) {
   		$("#pgs-1>a").html(ui.value);
   	}
   });
   $("#pgs-2").slider({
   	min: 1,
   	max: 10,
   	step: 1,
   	value: 0,
   	slide: function(event, ui) {
   		$("#pgs-2>a").html(ui.value);
   	}
   });

    

	// user login details
	UserLogin();

	// grab the config data from the DB
	$.getJSON("data.php", {source:"CONFIG",action:"GET"}, 
	function(Data)
	{
		// load DB values into internal construct
		CoinTots.Bank = Data.BankStart;
		GameConfig.AdminUser = Data.AdminID;
		GameConfig.Blocks = Data.Blocks;
		GameConfig.Rounds = Data.Rounds;
		GameConfig.Sizes = Data.Sizes.split(',');
		GameConfig.Prices = Data.Prices.split(',');
		GameConfig.AnimateCoinInterval = Data.AnimateCoinInterval;
		GameConfig.AnimateCoinSpeed = Data.AnimateCoinSpeed;
		GameConfig.AnimateCoinFade = Data.AnimateCoinFade;
	});


	// update screen intro info
	$(".rounds").each(function() {$(this).html(GameConfig.Rounds);});
	$(".total_rounds").each(function() {$(this).html(GameConfig.Blocks * GameConfig.Rounds);});


	// navigate to relevant screen
	var ScrArray = GameConfig.CurrentScreen.split(',');
	switch(ScrArray[0])
	{
		case "LANDING":
			$("#landing").show();
			break;
		case "CONSENT":
			$("#consent").show();
			break;
		case "INTRO":
			$("#intro").show();
			$.getJSON("data.php", {source:"USER",action:"SET",scr:"INTRO"});
			break;
		case "CD":
			SetGameStats(ScrArray);
			CollectorDecision();
			break;
		case "CA":
			SetGameStats(ScrArray);
			$("#coin_tots").show();
			$("#this_round").show();
			$("#round_start").show();
			$("#coin_drop").show();
			CoinsAppear();
			break;
		case "PBS":
			SetGameStats(ScrArray);
			$("#postblocksurvey").show();
			PBS();
			break;
		case "PGS":
			SetGameStats(ScrArray);
			$("#postgamesurvey").show();
			PGS();
			break;
	}
});

//
// User Login & initial screen decision
//
function UserLogin()
{
	GameConfig.CurrentScreen = "LANDING";
	GameConfig.LoggedUser = '';

	if($("#user").val().length > 0){
		CheckUserID();
	}

	if(GameConfig.LoggedUser.length == 0)
	{
		$("#landing").show();
	}
	else
	{
		$("#landing").hide();
		if(GameConfig.CurrentScreen == ""){
			GameConfig.CurrentScreen =	"CONSENT";	
		} 
	}
}

//
// User Consent
//
function UserConsent()
{
	GameConfig.CurrentScreen = "INTRO";
	$("#consent").hide();
	
	$("#intro").show();

}



//
// Post Block Survey Results
// fired by button click
//
function PBS()
{
	Log("PBS");
	$("#pbs-1").slider( "value", 0 );
	$("#pbs-2").slider( "value", 0 );
	$("#pbs-1>a").html("");
	$("#pbs-2>a").html("");
	
	if(CoinTots.CurrentRound == GameConfig.Rounds*GameConfig.Blocks+1)
	{
		DumpActivity("PGS");
		$("#postblocksurvey").hide();
		$("#postgamesurvey").show();
	}
	else
	{
		$("#round_start").show();
		CollectorDecision();
	}
}


//
// Post Game Survey Results
// fired by button clicked
//
function PGS()
{
	Log("PGS");
	$("#postgamesurvey").hide();
	$("#completioncode").html(GameConfig.LoggedUser+CoinTots.Bank+Math.floor((Math.random()*9)));
	$("#credits").show();
}


//
// display current round statistics on screen
//
function DispRoundStats()
{
	$("#this_round .stat").css('opacity',0);
	
	$("#curr_round").html(CoinTots.CurrentRound);
	$("#coins_poss_this").html(CoinRound.Possible);
	$("#coins_coll_this").html(CoinRound.Collected);
	$("#coins_lost_this").html(CoinRound.Lost);
	
	$("#this_round .stat").animate({opacity:1});
}

//
// display overall statistics on screen
//
function DispOverallStats()
{
	$("#all_rounds .stat").css('opacity', 0);
	
	$("#coins_poss_tot").html(CoinTots.Possible);
	$("#coins_coll_tot").html(CoinTots.Collected);
	$("#coins_lost_tot").html(CoinTots.Lost);
	$("#coins_spent_tot").html(CoinTots.Spent);
	$("#coins_bank_tot").html(CoinTots.Bank);

	
	$("#all_rounds .stat").animate({opacity:1});
}



//
// calculate the screen dimensions of a collector
//
function CollectorPixels(Size)
{
	// calculate the collector scale
	//var Min = GameConfig.Sizes[0];
	//var Max = GameConfig.Sizes[GameConfig.Sizes.length-1];
	//var Scale = 375/(Max-Min);

	//return (Size*Scale);
	return(Size*40+10);
}


// 
// populate table of collectors
//
function FillTable(TableName,HasButtons,Selected)
{
	// remove all current table rows
	$("#"+TableName+" tr").remove();

	// add in headings
	var Heading = "<th align='right'></th><th>Size</th><th>Cost</th>";
	if(HasButtons)
		Heading += "<th>Buy</th>";
	$("#"+TableName).append("<tr>"+Heading+"</tr>");

	// add in values
	for(var i=0; i<GameConfig.Sizes.length; i++)
	{
		var Size = GameConfig.Sizes[i];
		var Price = GameConfig.Prices[i];
		var Width = CollectorPixels(Size);

		var c1 = "<td align='right'><img src='images/slot.png' height='25' width='"+ Width +"'></td>";
		var c2 = "<td class='tablecol' style='padding-right: 40px;'>"+Size+"</b></td>";
		var c3 = "<td class='tablecol' style='padding-right: 20px;'>"+Price+" coins </td>";
		var c4 = '';
		if(HasButtons)
			c4 = "<td class='tablecol'><input type='radio' name='radio_buy' value='"+i+"'></td>";
		$('#'+TableName).append("<tr id='"+TableName+"_row"+i+"'>"+c1+c2+c3+c4+"</tr>");
	}

	//
	$("input:radio[name='radio_buy']").click(function(){CollectorSelectClicked($(this).val()*1+1)});

	// highlight selected row if required
	if(Selected != null)
	{
		var RowDef = $("#"+TableName+"_row"+Selected);
		RowDef.addClass("selected");
	}
}


//
// Game start following intro
//
function GameStart()
{
	// initial values
	CoinTots.CurrentRound = 1;
	CoinRound.CurrentRound = 1;
	CurrentBlock.Num = 0;

	// UI screen changes
	$("#intro").hide();

	CollectorDecision();
}


//
// Collector Decision
//
function CollectorDecision()
{
	$("#this_round").hide();
	$("#round_start").hide();
	$("#postblocksurvey").hide();
	$("#coin_tots").show();
   $("#btn-buy").prop("disabled",false);
   $("#btn-buy").html("Select a collector");
	$("#btn-bank").prop("disabled",true);
	$("#btn-next").prop("disabled",true);

	DispOverallStats();

	FillTable('buy_collectors', true, null);
	
	$("#select_collect").show();

	DumpActivity("CD");
}

//
// Collector select clicked
//
function CollectorSelectClicked(value)
{
	$("#btn-buy").html("Buy collector "+value);	
}

//
// buy button clicked
//
function BuyCollector()
{
	var CollectorSelected = $("input:checked").val();
	if(CollectorSelected == undefined)
		alert('Please select which collector you would like to buy');
	else
	{
		var Width = CollectorPixels(CollectorSelected);

		// establish current block values then log on DB
		CurrentBlock.Num++;
		CurrentBlock.Cost = parseInt(GameConfig.Prices[CollectorSelected]);
		CurrentBlock.Size = parseInt(GameConfig.Sizes[CollectorSelected]);
		Log("BLOCK");

		// screen flips
		$("#select_collect").hide();
		$("#round_start").show();
		$("#coin_drop").show();

		// display selection
		FillTable('bought_collectors', false, CollectorSelected);
		$("#collector_slot").attr("width",Width.toString());
		$("#this_round").show();
		$("#btn-buy").prop("disabled",true);
		$("#btn-next").prop("disabled",true);

		// calculate & display new screen totals
		CoinTots.Spent += CurrentBlock.Cost;
		CoinTots.Bank -= CurrentBlock.Cost;

		CoinsAppear();
		DispRoundStats();
		DispOverallStats();
	}
}



//
// display coins
//
function CoinsAppear()
{
	var CoinDrops = new GetCoins();

	// generate round data & log it
	CoinDrops.SetPossible(CoinTots.CurrentRound);
	CoinRound.Possible = CoinDrops.Possible;
	CoinRound.Spent = CurrentBlock.Cost;
	CoinRound.Collected = Math.min(CurrentBlock.Size, CoinDrops.Possible);
	CoinRound.Lost = Math.max(0, CoinRound.Possible - CoinRound.Collected);
	Log("ROUND");

	// collected coins display
	$("#coin_drop").show();
	$("#btn-bank").html("Deposit "+CoinRound.Collected+" Coins");	
	$("#btn-bank").prop("disabled",false);


	while(CoinDrops.Shown < CoinRound.Collected)
		CoinDrops.ShowCoinCollected();

	// pad out to full collector size with 'ghost' coins
	while(CoinDrops.Shown < CurrentBlock.Size)
		CoinDrops.GhostCoin();

	// lost coins display
	while(CoinDrops.Shown < CoinRound.Possible)
		CoinDrops.ShowCoinLost();

	DumpActivity("CA");
}



//
// Bank Coins Button Press
//
function BankCoins()
{
	var Interval, CoinNum;


	// every second call coin movement
	Interval = GameConfig.AnimateCoinInterval * 1000;
	for(CoinNum=0; CoinNum<CoinRound.Collected; CoinNum++)
		setTimeout(CoinMove, CoinNum*Interval, CoinNum);


	// fadeout the lost coins
	for(CoinNum=CoinRound.Collected; CoinNum<CoinRound.Possible; CoinNum++)
		setTimeout(CoinFade, CoinNum*Interval, CoinNum);


	// change screen attribs
	$("#btn-bank").html("Deposit Coins");	
	$("#btn-bank").prop("disabled",true);


	// update totals
	CoinTots.Possible += CoinRound.Possible;
	CoinTots.Collected += CoinRound.Collected;
	CoinTots.Lost += CoinRound.Lost;
	CoinTots.Bank += CoinRound.Collected;

	DispOverallStats();
		
	// button display
	setTimeout(function(){ $("#btn-next").prop("disabled",false); }, CoinRound.Possible*Interval+200);
}


//
// Coin Fade
// called on a timer interrupt
//
function CoinFade(i)
{
	$("#coin"+i).fadeOut(GameConfig.AnimateCoinFade*1000);
}



//
// Coin Animation
// called on a timer interrupt
//
function CoinMove(i)
{
	$("#coin"+i).css("visibility","hidden");
	$('#coins_move').show();
	$("#coins_move").animate({backgroundPositionX: "+=40"}, GameConfig.AnimateCoinSpeed*1000, function()
		{
			$('#coins_move').hide();
			$("#coins_move").css("background-position", "0px 0px");
		});
}


//
// Next Round Button Press
//
function NextRound()
{
	$("#btn-next").prop("disabled",true);

	CoinTots.CurrentRound ++;

	if(CoinTots.CurrentRound % GameConfig.Rounds == 1)
	{
		DumpActivity("PBS");
		$("#round_start").hide();
		$("#coin_tots").hide();
		$("#postblocksurvey").show();
	}
	else
	{
		$("#coin_drop").show();
		CoinsAppear();
		DispRoundStats();
	}
}

//
// user validation
//
function CheckUserID()
{
	$.getJSON("data.php", {source:"USER",action:"GET",id:$("#user").val()}, 
	function(Data)
	{
		if(Data.ID != undefined)
		{
			// set global object values
			GameConfig.LoggedUser = Data.ID;
			GameConfig.CurrentScreen = Data.LastScreen;
			GameConfig.LastActivity = Data.LastActivity;

			// hide screen display totals if required
			if(Data.showTCP == false)
				$("#tcp").hide();
			if(Data.showTCC == false)
				$("#tcc").hide();
			if(Data.showTCL == false)
				$("#tcl").hide();
			if(Data.showCS == false)
				$("#cs").hide();
		}
	});
}


//
// Write Log files
//
function Log(Action)
{
	var p1,p2,p3,p4,p5;

	switch(Action)
	{
		case "BLOCK":
			p1 = CurrentBlock.Num;
			p2 = CurrentBlock.Size;
			p3 = -1;
			p4 = -1;
			p5 = -1;
			break;
		case "ROUND":
			p1 = CurrentBlock.Num;
			p2 = CoinTots.CurrentRound;
			p3 = CoinRound.Possible;
			p4 = CoinRound.Collected;
			p5 = -1;
			break;
		case "PBS":
			p1 = "slider-pbs1";
			p2 = $("#pbs-1").slider("value");
			p3 = "slider-pbs2";
			p4 = $("#pbs-2").slider("value");
			p5 = CurrentBlock.Num;
			Action = "SURVEY";
			break;
		case "PGS":
			p1 = "slider-pgs1";
			p2 = $("#pgs-1").slider("value");
			p3 = "slider-pgs2";
			p4 = $("#pgs-2").slider("value");
			p5 = CurrentBlock.Num;
			Action = "SURVEY";
			break;
	}

	$.getJSON("data.php", {source:"LOG", action:Action, p1:p1, p2:p2, p3:p3, p4:p4, p5:p5});
}


//
// Record current screen status in case of refresh
//
function DumpActivity(Scr)
{
	var ScrData = Scr;
	ScrData += ",bn:"+CurrentBlock.Num;
	ScrData += ",cr:"+CoinTots.CurrentRound;
	ScrData += ",tp:"+CoinTots.Possible;
	ScrData += ",tc:"+CoinTots.Collected;
	ScrData += ",tl:"+CoinTots.Lost;
	ScrData += ",ts:"+CoinTots.Spent;
	ScrData += ",tb:"+CoinTots.Bank;
	ScrData += ",cs:" + $("input:radio[name='radio_buy']:checked").val();
	$.getJSON("data.php", {source:"USER",action:"SET",scr:ScrData});
}

//
// Read current screen status on refresh
//
function SetGameStats(Tots)
{
	for(var i=1; i<Tots.length; i++)
	{
		var split = Tots[i].split(':');
		var num = parseInt(split[1]);
		switch(split[0])
		{
			case "bn": CurrentBlock.Num = num; break;
			case "cr": CoinTots.CurrentRound = num; break;
			case "tp": CoinTots.Possible = num; break;
			case "tc": CoinTots.Collected = num; break;
			case "tl": CoinTots.Lost = num; break;
			case "ts": CoinTots.Spent = num; break;
			case "tb": CoinTots.Bank = num; break;
			case "cs": FillTable('bought_collectors', false, num); break;
		}					
	}
}


//
// Hide all HTML screens scections
//
function HideScreens()
{
	//$("#landing").hide();
	$("#intro").hide();
	$("#consent").hide();
	$("#coin_tots").hide();
	$("#round_start").hide();
	$("#select_collect").hide();
	$("#postblocksurvey").hide();
	$("#postgamesurvey").hide();
	$("#admin").hide();
	$("#credits").hide();
}


