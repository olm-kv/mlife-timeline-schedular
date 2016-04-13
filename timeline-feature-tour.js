function showTour() {
    var enjoyhint_instance = new EnjoyHint({});
    var enjoyhint_script_steps = [
        {
            "next .timeline-nav": 'The navigation bar lets you move backwards and forwards and shows the current start date.<br> Click "Next" to proceed.'
        },
        {
            "next .home": "Each care home appears as a row.  The row can be clicked to expand and show individual beds and bookings. Clicking the heading again to hide beds."
        },
        {
            "click .row-timeline": "The row heading shows the number of vacant beds matching your search on any given day. This can also be clicked to expand and hide the beds in a care home.  Please click this row to continue."
        },
        {
            "next .bed-label": "Each available bed is listed. The S or L icon denotes long or short stay."
        },
        {
            "next .bed": "The right hand side shows available beds and bookings. Clicking any empty date allows you to request a new booking for this bed. Clicking a booking will show details about the booking."
        }
    ];

    enjoyhint_instance.set(enjoyhint_script_steps);
    enjoyhint_instance.run();
}
