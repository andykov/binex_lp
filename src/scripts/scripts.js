$(document).ready(function() {

	var $document   = $(document),
		$inputRange = $('input[type="range"]'),
		$percent = $('#calc').data('percent');
	
	function valueOutput(element) {
		var value = element.value,
			output = element.parentNode.getElementsByTagName('output')[0];
		output.innerHTML = value;
	}
	
	function resultCalc() {
		var inputRate = $('#rate').val(),
			inputSuccessDeal = $('#successDeal').val(),
			inputSignalsDeal = $('#signalsDeal').val(),
			inputTradingDays = $('#tradingDays').val();

		inputRate = ($percent * inputRate) / 100;
		var result = (inputRate * (inputSuccessDeal * inputSignalsDeal)) * inputTradingDays;
		$('#calcResult').html(result);
		$('#calcResultDay').html(inputTradingDays);
	}
	for (var i = $inputRange.length - 1; i >= 0; i--) {
		valueOutput($inputRange[i]);
	};
	$document.on('input', 'input[type="range"]', function(e) {
		valueOutput(e.target);
		resultCalc();
	});
  
	resultCalc();

	$inputRange.rangeslider({
	  polyfill: false 
	});

	// // slick slider
	// $("#signalsSlider").slick({
	// 	autoplay: true,
	// 	dots: true,
	// 	arrows: false,
	// 	speed: 1000
	// });

	$("#reviewsSlider").slick({
		autoplay: false,
		dots: false,
		arrows: true,
		speed: 400,
		fade: true
	});

	// button disabled if not checked checkbox accept
	$('.form-reg').on('click', '#accept', function(){
		if ($(this).prop('checked') == true) {
			$(this).attr('checked','checked');
			$('.form-reg').find('.btn').removeAttr('disabled');
		} else {
			$(this).removeAttr('checked');
			$('.form-reg').find('.btn').attr('disabled','disabled');
		};
	});

	$('.nav').on('click', '#navMobile', function(){
		$(this).parent().toggleClass('nav_fixed').add($('body').addClass('noscroll'));
	});

	// modal
	var modalTrigger = $('a').data('modal');
	$(document).on('click', 'a[data-modal]', function(){
		if ($(this).data('modal') === true) {
			// $(this).attr('href');
			var modalId = $(this).attr('href').substr(1);
				// modalId = modalId.substr(1, modalId.length);
			$('.overlay').stop().fadeIn(200).addClass('modal--open');
			$('#' + modalId).stop().fadeIn(200).removeClass('modal--open');
		} else {
			return false;
		};
	});

});