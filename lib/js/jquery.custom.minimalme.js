jQuery(document).ready(function($){
	$("#nav a, .go_top, .cv_email").click(
		function(e) {			
			e.preventDefault();
			id = $(this).attr('href');
			scrollTo(id);
		}
	);
	function scrollTo(id){
			$('html,body').animate({scrollTop: $(id).offset().top},'slow');
	}
})