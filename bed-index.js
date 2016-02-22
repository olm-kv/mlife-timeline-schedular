// Present the bed data for debug
     $(document).ready(function() {
         var data = JSON.stringify(bedData, null, 4);
         $('#code').text(data);
         BedManager.init(bedData, {
             theme: 'green-timeline',
             onClickBooking: viewBooking,
             onClickVacancy: newBooking,
             onClickBed: editBed
         });
         
         // Reddraw timeline after resize
         var resizeTimer;
         $(window).on('resize', function (e) {

             clearTimeout(resizeTimer);
             resizeTimer = setTimeout(function () {
                 update();

             }, 100);

         });

     });
        
// Update data in timeline -- Test harness
function update() {
    bedData = JSON.parse($('#code').val());
    BedManager.init(bedData);
}


        
// Example custom function for view click handler
function viewBooking(e) {
    e.stopPropagation();
    var el = e.target, $modal;

    var ref = el.dataset !== undefined && el.dataset['ref'] != undefined ? el.dataset['ref'] : el.getAttribute("ref");

    var client = el.dataset !== undefined && el.dataset['client'] != undefined ? el.dataset['client'] : el.getAttribute("client");

    var status = el.dataset !== undefined && el.dataset['status'] != undefined ? el.dataset['status'] : el.getAttribute("status");
    
    var start = el.dataset !== undefined && el.dataset['start'] != undefined ? el.dataset['start'] : el.getAttribute("start");

    var duration = el.dataset !== undefined && el.dataset['duration'] != undefined ? el.dataset['duration'] : el.getAttribute("duration");
    // Hide all action buttons
    $('.cancel-booking-button').hide();

    // Identify the modal based on status
    switch (status) {
        case 'booked':
            //$modal = $('#view-booking-modal');
            updateBookingRequest(e);
            return;
            break;
        case 'requested':
            //$modal = $('#view-booking-modal');
            //$('.cancel-booking-button').show();
            editBookingRequest(e);
            return ;
            break;
        case 'in-use':
            editSupension(e);
            return;
            break;
        case 'available':
            //$modal = $('#new-booking-modal');
            addBookingRequest(e);
            return;
            break;
        default:
            $modal = $('#view-booking-modal');
            break;
    }
         
    // Update modal with values
    // We would fetch booking data from API here...
    $('.booking-ref', $modal).text(ref);
    $('.client', $modal).text(client);
    $('.start', $modal).text(start);
    $('.duration', $modal).text(duration + ' day' + ((duration > 1) ? 's' : ''));
            
    $('#view-booking-modal').modal();
}
        
// Click handler for empty row event
function newBooking(e) {                                                 
    e.stopPropagation();
    var el = e.target,
        bedId = el.id,
        col = parseInt(e.offsetX / 30, 10),
        date = moment(BedManager.startDate).add(col, 'days');//,
        //$modal;
    
    addBookingRequest(e, date.format('DD/MM/YYYY'));

    //$modal = $('#new-booking-modal');
    //$('.bed-id', $modal).text(bedId);
    //$('#start-date', $modal).val(date.format('DD/MM/YYYY'));
    //$modal.modal();
}
