(function ($) {
    /**
     * handlers is an array with handlers of users of UVa Online Judge
     **/
    /*var handlers = ['thnkndblv', 'aldo.aragon', 'alda', 'hopkins', 'Sirrah', 'tomy_stark', 'zubzero', 'Casio',
        'Kenin_4', 'daniman', 'positr0nix', 'jlgansito'];*/

    var handlers = ['kat te zero', 'hg.pc', 'chava05', 'slyfer__', 'duendearmine', 'ita CruPach',
        'majc', 'zubzero', 'SBMarin', 'mixtecalex', 'Luis Castro', 'aquinovo', 'lopillo', 'Casio', 'roshak'];

    /**
     * req is an array with requests to uHunt API to get the users ids
     **/
    var req = [];
    req.push($.getJSON('http://uhunt.felix-halim.net/api/p'));
    $.each(handlers, function (i, item) {
        req.push($.getJSON('http://uhunt.felix-halim.net/api/uname2uid/' + item));
    });

    /**
     * jQuery.when helps to wait up to all asynchronous requests are finished, after that done is executed.
     **/
    $.when.apply($, req)
        .done(function () {
            /**
             * uid is an array with the user ids.
             **/
            var uid = [];
            $.each(Array.prototype.slice.call(arguments), function (i, item) {
                // An valid user id is greater than 0, otherwise means the given user handler doesn't exist.
                if (item[0] > 0) {
                    uid.push(item[0]);
                }
            });

            /**
             * req is an array with the request to uHunt API to get the user submissions.
             **/
            var req = [];
            $.each(uid, function (i, item) {
                req.push($.getJSON('http://uhunt.felix-halim.net/api/subs-user/' + item));
            });

            // Process each problem by id
            var problem = {};
            var listOfProblems = arguments[0][0];
            for (var i = 0; i < listOfProblems.length; i++) {
                problem[ listOfProblems[i][0] ] = listOfProblems[i];
            }

            /**
             * jQuery.when helps to wait until all asynchronous requests are finished.
             **/
            $.when.apply($, req)
                .done(function () {
                    /**
                     * user is an array that contains the user's data.
                     **/
                    var users = [];
                    $.each(arguments, function (i, response) {
                        users.push(response[0]);
                    });

                    /**
                     * For each user obtains a list with solved problems, and generate the respective table.
                     **/
                    var uList = [];
                    $.each(users, function (index, user) {
                        /**
                         * solved is an array with the submissions whose responses is accepted.
                         **/
                        var solved = [];
                        $.each(user['subs'], function (i, submission) {
                            // if submission is accepted then add it to solved array.
                            if (submission[2] === 90) {
                                solved.push(submission);
                            }
                        });

                        // Sorts in ascending order first by problem ID and second by date.
                        solved.sort(function (a, b) {
                            if (a[1] != b[1]) return b[1] - a[1];
                            return b[4] - a[4];
                        });

                        var subs = user['subs'].length;
                        var countSolved = 0;
                        var countRecently = 0;
                        var recently = [];

                        // Counts only distinct problems.
                        for (var i = 0, j = 0; i < solved.length; i = j) {
                            while (j < solved.length && solved[i][1] == solved[j][1]) j++;
                            countSolved++;
                            if (new Date((solved[i][4] + 172800) * 1000) >= new Date()) {
                                countRecently++;
                                recently.push( solved[i][1] );
                            }
                        }

                        uList.push({'uName'   : user['uname'],
                                    'subs'    : subs,
                                    'accepted': countSolved,
                                    'recent'  : recently,
                                    'name'    : user['name'],
                                    'id'      : uid[index]});
                    });
                    
                    uList.sort(function (a, b) {
                        if (a['accepted'] != b['accepted']) return b['accepted'] - a['accepted'];
                        if (a['subs'] != b['subs']) return a['subs'] - b['subs'];
                        if (a['uName'] < b['uName']) return -1;
                        if (a['uName'] > b['uName']) return 1;
                        return 0;
                    });

                    $('<table></table>')
                        .append($('<caption></caption>')
                            .append(spanString('UVa Online Judge')))
                        .append($('<thead></thead>')
                            .append($('<tr></tr>')
                                .append($('<th></th>')
                                    .text('#'))
                                .append($('<th></th>')
                                    .css('width', '100px')
                                    .text('Handle'))
                                .append($('<th></th>')
                                    .text('48h'))
                                .append($('<th></th>')
                                    .text('Sub'))
                                .append($('<th></th>')
                                    .text('AC'))))
                        .append('<tbody></tbody>')
                        .addClass('ratingTable')
                        .appendTo('#uva');

                    $.each(uList, function (i, item) {
                        if (i == 10) return false;

                        var red = uList[0]['accepted'] == 0
                            ? 0 : item['accepted'] / uList[0]['accepted'];
                        red = Math.floor((1.0 - red) * 55);

                        var currentRow = $('<tr></tr>')
                            .append($('<td></td>')
                                .text(i + 1))
                            .append($('<td></td>')
                                .append($('<a></a>')
                                    .text(item.uName)
                                    .attr('title', item.name)
                                    .attr('target', '_blank')
                                    .attr('href', 'http://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=19&page=show_authorstats&userid=' + item.id))
                                .css('font-weight', 'bold')
                                .css('color', 'hsla(' + red + ', 100%, 50%, 0.94)'))
                            .append($('<td></td>')
                                .text((item.recent.length > 0 ? '+' : '') + item.recent.length)
                                .css('font-weight', item.recent.length > 0 ? 'bold' : 'normal')
                                .css('color', item.recent.length > 0 ? 'hsla(' + red + ', 100%, 50%, 0.94)' : 'black'))
                            .append($('<td></td>')
                                .text(item.subs))
                            .append($('<td></td>')
                                .append($('<a></a>')
                                    .text(item.accepted)
                                    .attr('target', '_blank')
                                    .attr('href', 'http://uhunt.felix-halim.net/id/' + item.id))
                                .css('font-weight', 'bold')
                                .css('color', 'hsla(' + red + ', 100%, 50%, 0.94)'))
                            .appendTo('#uva table tbody');

                        if ( item.recent.length > 0 ) {
                            var listRecentlySolved = function (r) {
                                var ret = [];

                                for (var i = 0; i < r.length; i++) {
                                    var pid = r[i];
                                    ret.push( '<a class="solvedProblemLink" href="http://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&category=24&page=show_problem&problem='
                                        + problem[pid][0] + '" target="_blank"><span style="color: red;">' + problem[pid][1] + '</span> - ' + problem[pid][2] + '</a>' );
                                }

                                return ret;
                            }(item.recent).join('<br />');

                            currentRow.find(':nth-child(3)').qtip({
                                content: {
                                    text: listRecentlySolved
                                },
                                position: {
                                    my: 'left center',
                                    at: 'right center'
                                },
                                show: {
                                    delay: 250
                                },
                                hide: {
                                    delay: 250,
                                    fixed: true
                                },
                                style: {
                                    classes: 'qtip-youtube'
                                }
                            });
                        }
                    });
                });
        });
})(jQuery);
