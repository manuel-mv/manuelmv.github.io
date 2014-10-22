(function ($) {
    var me      = this;
    var handles = ['adroyl', 'alda', 'Gansito144', 'hopkins', 'kenin_4', 'positr0nix', 'thnkndblv', 'tomystark.0', 'DanielRuiz', '_manu_'];
    
    /*$.getJSON("http://codeforces.com/api/user.info?handles=" + handles.join(';') + "&jsonp=?", function (data) {
        var reqTime = [ $.now() ];

        $('<table></table>')
            .append($('<caption></caption>')
                .append(spanString('Codeforces')))
            .append($('<thead></thead>')
                .append($('<tr></tr>')
                    .append($('<th></th>')
                        .text('#'))
                    .append($('<th></th>')
                        .text('Handle')
                        .css('width', '100px'))
                    .append($('<th></th>')
                        .text('#C'))
                    .append($('<th></th>')
                        .text('Max'))
                    .append($('<th></th>')
                        .text('Rating'))))
            .append('<tbody></tbody>')
            .addClass('ratingTable')
            .appendTo('#codeforces');

        $.each(data.result, function (i, item) {
            item['rank'] = item['rank'] || 'unrated';
            item['maxRank'] = item['maxRank'] || 'unrated';
            item['rating'] = item['rating'] || 0;
            item['maxRating'] = item['maxRating'] || 0;
        });

        data.result.sort(function (a, b) {
            if (a.rating != b.rating) {
                return (a.rating < b.rating) ? 1 : -1;
            }

            if (a.handle != b.handle) {
                return (a.handle.toLowerCase() < b.handle.toLowerCase()) ? -1 : 1;
            }

            return 0;
        });

        var opts = {
            lines: 7, // The number of lines to draw
            length: 2, // The length of each line
            width: 2, // The line thickness
            radius: 2, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#000', // #rgb or #rrggbb or array of colors
            speed: 1.5, // Rounds per second
            trail: 10, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%', // Left position relative to parent
            position: 'relative'
        };

        $.each(data.result, function (i, item) {
            $('<tr></tr>')
                .append($('<td></td>')
                    .text(i + 1))
                .append($('<td></td>')
                    .addClass(item.rank.split(' ').join('_'))
                    .append($('<a></a>')
                        .attr('href', 'http://codeforces.com/profile/' + item.handle)
                        .attr('target', '_blank')
                        .attr('title', item.rank)
                        .text(item.handle)))
                .append('<td></td>')
                .append($('<td></td>')
                    .addClass(item.maxRank.split(' ').join('_')))
                .append($('<td></td>')
                    .addClass('ratingColumn'))
                .appendTo('#codeforces table tbody');

            var tds = $('#codeforces').find('table tbody tr:last td');
            new Spinner(opts).spin(tds[2]);
            new Spinner(opts).spin(tds[3]);
            new Spinner(opts).spin(tds[4]);

            var timeToWait = (reqTime.length < 4) ? 0 : Math.max(0, 1300 - ($.now() - reqTime[reqTime.length - 4]));

            setTimeout(function () {
                $.when($.getJSON("http://codeforces.com/api/user.rating?handle=" + item.handle + "&jsonp=?"))
                    .then(function (data) {
                        var len = data.result.length;

                        $(tds[2]).find('div').remove()
                            .end()
                            .text( len );

                        $(tds[3]).find('div').remove()
                            .end()
                            .text( item.maxRating );

                        if (len > 0) {
                            var oldRating = data.result[len - 1]['oldRating'];
                            var newRating = data.result[len - 1]['newRating'];

                            $(tds[4]).find('div').remove()
                                .end()
                                .text( item.rating );
                            if (oldRating > newRating) {
                                $(tds[4]).addClass('decRating');
                            }
                            else {
                                $(tds[4]).addClass('incRating');
                            }
                        }
                        else {
                            $(tds[4]).find('div').remove()
                                .end()
                                .text( item.rating );
                        }
                    });
            }, timeToWait);

            reqTime.push($.now() + timeToWait);

            if (i >= 9) return false;
        });
    })
        .fail(function () {
            console.log("Error: No response from codeforces.com")
        });*/
    
    CodeforcesJsonReqests.userRating( handles, (function () {
        var minUpdtTime = null;
        var maxUpdtTime = null;

        var minRating = null;
        var maxRating = null;
        $.each(arguments, function (idx, item) {
            $.each(item.result, function (idx, rateChange) {
                if ( minUpdtTime == null ) minUpdtTime = rateChange.ratingUpdateTimeSeconds;
                else minUpdtTime = Math.min(minUpdtTime, rateChange.ratingUpdateTimeSeconds);

                if ( maxUpdtTime == null ) maxUpdtTime = rateChange.ratingUpdateTimeSeconds;
                else maxUpdtTime = Math.max(maxUpdtTime, rateChange.ratingUpdateTimeSeconds);

                if ( minRating == null ) minRating = rateChange.newRating;
                else minRating = Math.min( minRating, rateChange.newRating );

                if ( maxRating == null ) maxRating = rateChange.newRating;
                else maxRating = Math.max( maxRating, rateChange.newRating );
            });
        });

        minRating -= 50;
        maxRating += 50;

        minUpdtTime -= 2592000;
        maxUpdtTime += 2592000;

        var canvas = document.getElementById('cfGraph');

        var canvasW = canvas.width;
        var canvasH = canvas.height;

        var ctx = canvas.getContext('2d');

        var colors = [
                '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
                '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
            ];

        function DrawPoint(ctx, cx, cy, fillColor) {
            ctx.globalAlpha = 0.75;
            ctx.beginPath();
            ctx.arc(cx, cy, 4, 0, 2 * Math.PI, false);
            ctx.fillStyle = fillColor;
            ctx.fill();
        }

        function getCoordinates(x, y) {
            var cx = x - minUpdtTime;
                cx /= maxUpdtTime - minUpdtTime;
                cx *= canvasW;

            var cy = y - minRating;
                cy /= maxRating - minRating;
                cy = (1.0 - cy) * canvasH;

            return {x: cx, y: cy};
        }

        function traceLine(ctx, p, q, color) {
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        var titles = [{
            min: -1000,
            max: 1199,
            color: 'gray',
            alpha: 0.2,
            title: 'Newbie'
        }, {
            min: 1200,
            max: 1349,
            color: '#00ff00',
            alpha: 0.1,
            title: 'Pupil'
        }, {
            min: 1350,
            max: 1499,
            color: '#00ff00',
            alpha: 0.2,
            title: 'Specialist'
        }, {
            min: 1500,
            max: 1699,
            color: '#0000ff',
            alpha: 0.2,
            title: 'Expert'
        }, {
            min: 1700,
            max: 1899,
            color: '#aa00aa',
            alpha: 0.2,
            title: 'Candidate master'
        }, {
            min: 1900,
            max: 2049,
            color: '#ff8c00',
            alpha: 0.1,
            title: 'Master'
        }, {
            min: 2050,
            max: 2199,
            color: '#ff8c00',
            alpha: 0.2,
            title: 'International master'
        }, {
            min: 2200,
            max: 2599,
            color: '#ff0000',
            alpha: 0.1,
            title: 'Grandmaster'
        }, {
            min: 2600,
            max: 1000000000,
            color: '#ff0000',
            alpha: 0.2,
            title: 'International grandmaster'
        }];

        $.each(titles, function (idx, obj) {
            var p = getCoordinates( minUpdtTime, Math.min( maxRating, obj.max ) );
            var q = getCoordinates( maxUpdtTime, Math.max( minRating, obj.min ) );

            if ( p.y < q.y ) {
                ctx.globalAlpha = obj.alpha;
                ctx.fillStyle = obj.color;
                ctx.fillRect( p.x, p.y, q.x - p.x, q.y - p.y );
                
                if (obj.min >= 0) {
                    ctx.globalAlpha += 0.5;
                    ctx.font = "bold 12px Arial";
                    //ctx.fillStyle = 'black';
                    ctx.fillText(obj.min, 5, q.y);
                }
            }
        }); 

        var userCount = 0;
        $.each(arguments, function (userIdx, item) {
            var q = null;
            var userColor = colors[ userCount % colors.length ];
            
            if ( item.result.length > 0 ) {
                ctx.globalAlpha
                ctx.fillStyle = userColor;
                ctx.fillRect( 35, 10 + 15 * userCount, 15, 12 );
                ctx.font = "bold 12px Arial";
                ctx.fillText(item.handle, 55, 20 + 15 * userCount);
            
                $.each(item.result, function (idx, rateChange) {
                    var p = getCoordinates( rateChange.ratingUpdateTimeSeconds, rateChange.newRating );
                    if ( q != null ) {
                        traceLine( ctx, q, p, colors[ userIdx % colors.length ] );
                    }
                    q = p;

                    DrawPoint(ctx, p.x, p.y, colors[ userColor ]);
                });
                
                userCount++;
            }
        });
    }).bind(me) );
})(jQuery);