﻿// Present the bed data for debug
     $(document).ready(function() {
         var data = JSON.stringify(bedData, null, 4);
         $('#code').text(data);
         Timeline.init(bedData, {
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
    Timeline.init(bedData);
}


        
// Example custom function for view click handler
function viewBooking(e) {
    e.stopPropagation();
    var el = e.target;

    var ref = el.dataset !== undefined && el.dataset['ref'] != undefined ? el.dataset['ref'] : el.getAttribute("ref");

    var client = el.dataset !== undefined && el.dataset['client'] != undefined ? el.dataset['client'] : el.getAttribute("client");

    var status = el.dataset !== undefined && el.dataset['status'] != undefined ? el.dataset['status'] : el.getAttribute("status");
    
    var start = el.dataset !== undefined && el.dataset['start'] != undefined ? el.dataset['start'] : el.getAttribute("start");

    var duration = el.dataset !== undefined && el.dataset['duration'] != undefined ? el.dataset['duration'] : el.getAttribute("duration");

    // Identify the modal based on status
    switch (status) {
        case 'booked':
            updateBookingRequest(e);
            return;
            break;
        case 'requested':
            editBookingRequest(e);
            return ;
            break;
        case 'in-use':
            editSupension(e);
            return;
            break;
        case 'available':
            addBookingRequest(e);
            return;
            break;
        default:
            break;
    }
}
        
// Click handler for empty row event
function newBooking(e) {                                                 
    e.stopPropagation();
    var el = e.target,
        bedId = el.id,
        col = parseInt(e.offsetX / 30, 10),
        date = moment(Timeline.startDate).add(col, 'days');
    addBookingRequest(e, date.format('DD/MM/YYYY'));
}
