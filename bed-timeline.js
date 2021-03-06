(function () {
    var BedManager = {
        titleText: 'Bed Status from ',
        bookingData: {},                                                            // Would come from ajax
        colWidth: 30,                                                               // Width of each col in px
        width: 0,                                                                   // Width of timeline col in px
        headingWidth: 0,                                                            // Width of heading column
        numberOfDays: 0,                                                            // Number of days in timeline
        dayClassName: 'timeline-date',                                              // Class name for days divs
        rowHeadClassName: 'home-no-expand',                                         // Class name for row heading
        startDate: '',                                                              // Start date for timeline
        endDate: '',                                                                // Computed end date for timeline
        data: {},                                                                   // Store initial bed data
        theme: 'default',                                                           // Theme class (default | blue | green)
        showBackButton: false,                                                      // Whether back button can be displayed
        $titleText: document.getElementById('timeline-title-text'),                 // Element holding the title text
        $timeline: document.getElementById('timeline'),                             // Timeline component element
        $table: document.getElementById('timeline-table'),                          // Table element
        $tableHead: document.getElementById('timeline-header'),                     // Table head element
        $header: document.getElementsByClassName('row-timeline-heading')[0],        // Heading element
        onClickBed: function (e) { console.log('bed', e); },                        // Click handler for a bed
        onClickBooking: function (e) { console.log('booking', e); },                // Click handler for a booking
        onClickVacancy: function (e) {                                              // Click handler for empty day
            e.stopPropagation();
            var col = parseInt(e.offsetX / 30, 10);
            console.log(col);
        },
        onHoverVacancy: function (e) {
            var klass,
                target = e.target;
            if (target.className.indexOf('bed') > -1) {
                klass = document.getElementById(target.id).className;
                klass = (klass.indexOf('hover') > -1) ? klass : klass + ' hover';
                document.getElementById(target.id).className = klass;
            }
        },
        onOutVacancy: function (e) {
            var klass,
                target = e.target;
            if (target.className.indexOf('bed') > -1) {
                klass = document.getElementById(target.id).className;
                klass = (klass.indexOf('hover') > -1) ? klass.replace(' hover', '') : klass;
                document.getElementById(target.id).className = klass;
            }
        },

        init: function init(data, options) {
            if (options !== undefined) { this.setOptions(options); }

            // Store data
            if (data !== undefined) {
                this.data = data;
            } else {
                data = this.data;   //TODO: circular - need to ensure data for first time
            }

            // Destroy current instance
            this.destroy();

            var startValue = this.$timeline.dataset !== undefined && this.$timeline.dataset['start'] != undefined ? this.$timeline.dataset['start'] : this.$timeline.getAttribute("start");

            // Set days in table headings
            // Get start date from timeline component.  If empty, use today.
            var startDateString = (this.startDate != '') ? this.startDate : startValue,
           startDate = (startDateString != '') ?
                    moment(startDateString, 'DD/MM/YYYY') :
                    moment().hour(0).minute(0).second(0);
            this.startDate = moment(startDate, 'DD/MM/YYYY');

            // Add title text including the start date
            this.$titleText.innerHTML = '';
            newTitle = this.titleText + ' ' + moment(this.startDate, 'DD/MM/YYYY').format('DD MMM YYYY');
            content = document.createTextNode(newTitle);
            this.$titleText.appendChild(content);

            // Draw header
            this.drawHeader(startDate);

            // Draw bookings
            this.bookingData = data;
            this.drawBookings(this.bookingData);

            // Truncate rows
            this.truncate();
        },

        setOptions: function setOptions(options) {
            var key;
            for (key in options) {
                this[key] = options[key];
            }
        },

        advance: function advance(days) {
            if (days === undefined) {
                // Go to next date range
                this.startDate = this.startDate.add(this.numberOfDays, 'days');
            } else {
                // Advance requested number of days
                this.startDate = this.startDate.add(days, 'days');
            }
            this.init();
        },

        back: function back(days) {
            if (days === undefined) {
                // Go to previous date range
                this.startDate = this.startDate.add(-this.numberOfDays, 'days');
                this.init();
            } else {
                // Go back requested number of days
                this.advance(-days);
            }
        },

        // Calculate how many days dateString occurs from start date of timeline
        positionFromDate: function positionFromDate(dateString) {
            var date = moment(dateString, 'DD/MM/YYYY');
            return moment.duration(date.diff(this.startDate)).asDays();
        },

        // Draw the header element
        drawHeader: function drawHeader(date) {
            var row = document.createElement('tr'),
                th1 = document.createElement('th'),
                th2 = document.createElement('th'),
                div = document.createElement('div'),
                content = document.createTextNode('Bed'),
                d;

            th1.className = 'row-heading ' + this.theme;
            th2.className = 'row-timeline-heading ' + this.theme;
            div.className = this.rowHeadClassName;
            div.appendChild(content);
            th1.appendChild(div);
            row.appendChild(th1);
            row.appendChild(th2);
            this.$tableHead.appendChild(row);

            // Setup header 
            this.headingWidth = th1.offsetWidth;
            this.width = th2.offsetWidth;
            this.numberOfDays = parseInt(this.width / this.colWidth, 10);

            // Draw days into header
            for (d = 0; d < this.numberOfDays; d++) {
                this.addDayToHeader(th2, date, this.dayClassName);
                date.add(1, 'days');
            }
            // Update endDate of component
            this.endDate = date.add(-1, 'days');
        },

        // Write day numbers into timeline header
        addDayToHeader: function addDayToHeader(el, date, className) {
            var div = document.createElement('div'),
                span = document.createElement('span'),
                spanmonth = document.createElement('span'),
                day = document.createTextNode(date.format('ddd')),
                d = document.createTextNode(date.format('D'));
            month = document.createTextNode(date.format('MMM')),
            m = date.format('MMM');
            div.className = className;
            // First day of month: need darker border
            if (date.date() === 1) {
                div.className += ' first'; div.setAttribute('title', m); div.appendChild(spanmonth); spanmonth.className = 'month';
                spanmonth.appendChild(month);
            }
            span.className = 'timeline-day';
            span.appendChild(day);
            div.appendChild(span);
            div.appendChild(d);
            el.appendChild(div);
        },

        // Draw a new row in timeline for each care home and
        // draw each booking rectangle into the correct row
        drawBookings: function drawBookings(data) {
            var timeline = this,
                $row,
                $bed;

            data.homes[0].beds.forEach(function (bed) {
                // Create new row
                $row = timeline.drawRow(bed.name, bed.id, bed.providerid, bed.type);
                $bed = timeline.drawBed(bed.id, bed.name);

                // Create each booking rectangle in row
                bed.bookings.forEach(function (booking) {

                    timeline.drawBooking(
                        $bed,
                        booking.ref,
                        booking.status,
                        booking.start,
                        booking.duration,
                        booking.client,
                        booking.id
                    );
                });
                $row.children[1].children[0].appendChild($bed);

                // Append rows to timeline table
                timeline.$table.appendChild($row);
            });
        },

        // Create and return the template structure for a 
        // Care Home row in the timleline table
        drawRow: function drawRow(name, bedid, providerid, type) {
            var row = document.createElement('tr'),
                heading = document.createElement('td'),
                bookings = document.createElement('td'),
                bookingsContainer = document.createElement('div'),
                bedLabelContainer = document.createElement('div'),
                div = document.createElement('div'),
                home = document.createTextNode(name),
                placementtype = document.createElement('div');

            div.setAttribute('bedid', bedid);
            div.setAttribute('providerid', providerid);

            row.className = 'expand';
            heading.className = 'row-heading ' + this.theme;
            bookings.className = 'row-timeline';
            bookingsContainer.className = 'bookings-container';
            bedLabelContainer.className = 'bed-container';
            div.className = this.rowHeadClassName + ' truncate';

            if (type === undefined) { type = 'long'; }
            placementtype.className = type + '-stay bed-type';
            placementtypeBadge = document.createElement('span');
            placementtypeBadge.className = 'bed-badge';
            placementtypeBadge.setAttribute('title', this.titleCase(type) + ' stay');
            placementtypeBadge.appendChild(document.createTextNode((type === 'short' ? 'S' : 'L')));

            placementtype.appendChild(placementtypeBadge);
            div.appendChild(placementtype);
            div.appendChild(home);
            bedLabelContainer.appendChild(div);

            heading.appendChild(bedLabelContainer);
            row.appendChild(heading);
            row.appendChild(bookings);
            bookings.appendChild(bookingsContainer);

            // Add row heading expand and contract handler
            heading.addEventListener('click', this.onClickBed);
            return row;
        },

        // Add a bed div element with a click handler
        drawBed: function drawBed(id, name) {
            var bed = document.createElement('div');
            bed.id = id;
            bed.className = 'bed';

            // Add bed container hover and click handlers (available day)
            bed.addEventListener('mouseover', this.onHoverVacancy);
            bed.addEventListener('mouseout', this.onOutVacancy);
            bed.addEventListener('click', this.onClickVacancy);
            return bed;
        },

        // Add an individual booking rectangle to element el
        drawBooking: function drawBooking(el, ref, status, start, duration, client, id) {
            var div = document.createElement('div'),
                content = document.createTextNode((client !== undefined) ? client : ''),
                date = moment(start, 'DD/MM/YYYY'),
                offset = this.positionFromDate(start), /* Number of days from start */
                left = ((offset * 30) < 0) ? 0 : (offset * 30);
            if (offset < 0)
                duration = Math.round(duration + offset); // offset is subtracted from duration

            var right = ((left + (duration * 30)) > this.width) ? this.width - 1 : (left + (duration * 30) - 1);
            var clonedStartDate = this.startDate.clone();

            // Only draw booking if it falls in current timeline range
            var displayStartDate = (date < clonedStartDate ? clonedStartDate : date);
            var clonedDisplayStartDate = displayStartDate.clone();
            var displayEndDate = clonedDisplayStartDate.add(duration, 'days');
            if ((displayStartDate < this.endDate) && (displayEndDate > this.startDate)) {
                // Styles
                div.className = 'booking ' + ((status !== undefined) ? status : '');
                div.id = ref;
                div.style.left = left + 'px';
                div.style.width = (right - left) + 'px';

                // Data and Events               
                if (ref !== undefined) { div.setAttribute('ref', ref); }
                if (status !== undefined) { div.setAttribute('status', status); }
                if (start !== undefined) { div.setAttribute('start', start); }
                if (client !== undefined) { div.setAttribute('client', client); }
                if (duration !== undefined) { div.setAttribute('duration', duration); }
                if (id !== undefined) { div.setAttribute('bookingid', id); }

                div.addEventListener('click', this.onClickBooking);

                div.appendChild(content);
                el.appendChild(div);
            }
        },

        destroy: function destroy() {
            // TODO: verify that eventlisteners are all detached
            this.removeChildren(this.$tableHead);
            this.removeChildren(this.$table);
        },

        removeHovers: function removeHovers() {
            var h = document.getElementsByClassName('hover'),
                i;
            for (i = 0; i < h.length; i++) {
                h[0].parentElement.removeChild(h[0]);
            }
        },

        removeChildren: function removeChildren(el) {
            var i, l;
            if (el.hasChildNodes()) {
                l = el.childNodes.length;
                for (i = 0; i < l; i++) {
                    el.removeChild(el.childNodes[0]);
                }
            }
        },

        truncate: function () {
            var $t = document.getElementsByClassName('bed-container'),
                i;
            for (i = 0; i < $t.length; i++) {
                $t[i].style.width = this.headingWidth + 'px';
            }
        },
        
        titleCase: function(str) {
            var newstr = str.split(" ");
            for (i = 0; i < newstr.length; i++) {
                var copy = newstr[i].substring(1).toLowerCase();
                newstr[i] = newstr[i][0].toUpperCase() + copy;
            }
            newstr = newstr.join(" ");
            return newstr;
        },

        debug: function (text) {
            document.getElementById('debug').innerText += text + '\n';
        }

    };

    window.Timeline = BedManager;

})();