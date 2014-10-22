(function ($) {
    var me = this;
    
    CodeforcesJsonReqests.commingContest( (function (response) { // Success Function
        var contest = [];
        $.each(response.result, function (i, item) {
            if (item['phase'] === 'BEFORE') {
                contest.push(item);
            }
        });

        contest.sort(function (a, b) {
            return a['id'] - b['id'];
        });

        $('<table></table>')
            .addClass('ratingTable')
            .append($('<caption></caption>')
                .append(spanString('Coming Contests')))
            .append('<tbody></tbody>')
            .appendTo('#comingContest');

        $.each(contest, function (i, item) {
            //console.log(item);
            var tr = $('<tr></tr>')
                .append($('<td></td>')
                    .append($('<div></div>')
                        .attr('id', 'contest' + item.id)
                        .append($('<a></a>')
                            .text(item['name'])
                            .attr('target', '_blank')
                            .attr('href', 'http://codeforces.com/contests')
                            .css('font-weight', 'bold')
                            .css('font-size', '11pt'))
                        .append($('<p></p>')
                            .addClass('cdContainer')
                            .attr('id', 'countdown' + item.id))))
                .appendTo('#comingContest table tbody');

            $('#countdown' + item.id).countdown(item['startTimeSeconds'] * 1000, function (event) {
                $(this).html(event.strftime('<span class="cdDays">%D<span style="color: red!important">D</span></span>'
                    + '<span class="cdHours">%H<span style="color: red!important">H</span></span>'
                    + '<span class="cdMinutes">%M<span style="color: red!important">M</span></span>'
                    + '<span class="cdSeconds">%S<span style="color: red!important">S</span></span>'));
            });

            var d = new Date();
            d = new Date(item['startTimeSeconds'] * 1000);

            tr.qtip({
                content: {
                    text: d.toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    })
                },
                position: {
                    my: 'right center',
                    at: 'left center'
                },
                style: {
                    classes: 'qtip-youtube'
                }
            });
        });
    }).bind(me), function () { // Failure function
        console.log('No se pudo conectar con el servido de codeforces.');
    } );
})(jQuery);