(function ($) {
    var me      = this;
    var handles = ['adroyl', 'alda', 'Gansito144', 'hopkins', 'kenin_4', 'positr0nix', 'thnkndblv', 'tomystark.0', 'DanielRuiz', '_manu_', 'chava05'];
    
    var requestAnimationFrame = (window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		(function(callback, element) {
			window.setTimeout(callback, 10);
		})).bind(window);
    
    CodeforcesJsonReqests.userInfo(handles, (function (response) {
        var users = {};
        var positions = [];
        
        $.each(response.result, function (index, item) {
            var handle = item.handle;
            
            positions.push(handle);
            
            if (!(handle in users)) users[handle] = {};
            
            users[handle]['handle']    = item['handle'];
            users[handle]['rank']      = item['rank']      || 'unrated';
            users[handle]['maxRank']   = item['maxRank']   || 'unrated';
            users[handle]['rating']    = item['rating']    || 0;
            users[handle]['maxRating'] = item['maxRating'] || 0;
        });
        
        positions.sort(function (a, b) {
            if (users[a].rating != users[b].rating) {
                return (users[a].rating < users[b].rating) ? 1 : -1;
            }

            if (users[a].handle != users[b].handle) {
                return (users[a].handle.toLowerCase() < users[b].handle.toLowerCase()) ? -1 : 1;
            }

            return 0;
        });
        
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
        
        CodeforcesJsonReqests.userRating(positions, (function () {
            $.each(arguments, function (index, item) {
                var handle           = item.handle,
                    lastRatedContest = null,
                    count            = null;
                
                if (!(handle in users)) users[handle] = {};
                
                users[handle]['ratedContests'] = item.result || [];
                count = users[handle]['ratedContests'].length;
                if (count > 0) {
                    lastRatedContest = users[handle]['ratedContests'][count - 1];
                }
                
                $('<tr></tr>')
                .append($('<td></td>')
                    .text(index + 1))
                .append($('<td></td>')
                    .addClass(users[handle].rank.split(' ').join('_'))
                    .append($('<a></a>')
                        .attr('href', 'http://codeforces.com/profile/' + handle)
                        .attr('target', '_blank')
                        .attr('title', users[handle].rank)
                        .text(handle)))
                .append($('<td></td>').text(users[handle]['ratedContests'].length))
                .append($('<td></td>')
                    .addClass(users[handle].maxRank.split(' ').join('_'))
                    .text(users[handle].maxRating))
                .append($('<td></td>')
                    .addClass('ratingColumn')
                    .addClass(lastRatedContest === null
                             ? ''
                             : lastRatedContest.newRating >= lastRatedContest.oldRating
                                ? 'incRating'
                                : 'decRating')
                    .text(users[handle].rating))
                .appendTo('#codeforces table tbody');
            });
            
            var minUpdtTime = null;
            var maxUpdtTime = null;

            var minRating = null;
            var maxRating = null;
            
            $.each(users, function (idx, item) {
                $.each(item.ratedContests, function (idx, rateChange) {
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

            function DrawPoint(ctx, cpoint, fillColor) {
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(cpoint.x, cpoint.y, 4, 0, 2 * Math.PI, false);
                ctx.fillStyle = fillColor;
                ctx.fill();
            }
            
            function DrawSpecialPoint(ctx, cpoint, fillColor, handle) {
                ctx.globalAlpha = 1;
                ctx.beginPath();
                
                ctx.fillStyle = fillColor;
                
                ctx.font = "11px Arial";
                var handleWidth = ctx.measureText(handle).width;
                var handleX = Math.min(cpoint.x, canvasW - 10 - handleWidth);
                var handleY = cpoint.y - 7;
                
                ctx.arc(cpoint.x, cpoint.y, 5, 0, 2 * Math.PI, false);
                ctx.arc(cpoint.x, cpoint.y, 2, 0, 2 * Math.PI, false);
                
                
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                
                ctx.fillRect( handleX - 2, handleY - 10, handleWidth + 4, 12 );
                
                ctx.strokeStyle = fillColor;
                ctx.stroke();
                
                ctx.fillStyle = fillColor;
                ctx.fillText(handle, handleX, handleY);
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

            function traceLine(ctx, p, q, color, alpha) {
                ctx.globalAlpha = alpha || 0.6;
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
            
            var mouseCoordinates = null;
            $('#cfGraph').mouseleave(function (eObj) {
                mouseCoordinates = null;
            });
            $('#cfGraph').mousemove(function (eObj) {
                var pos = $(this).offset();
                mouseCoordinates = {
                    x: eObj.pageX - pos.left,
                    y: eObj.pageY - pos.top
                };
            });
            
            requestAnimationFrame(function step() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
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
                
                if (mouseCoordinates !== null) {
                    traceLine( ctx, {x: mouseCoordinates.x, y: 0}, {x: mouseCoordinates.x, y: canvasH}, 'black', 0.1 );
                }
                
                var userCount = 0;
                var specialPoints = [];
                $.each(users, function (userIdx, item) {
                    var q = null;
                    var userColor = colors[ userCount % colors.length ];

                    if ( item.ratedContests.length > 0 ) {
                        var currentPosition = null;
                        var firstPoint = null;
                        var lastPoint = null;
                        $.each(item.ratedContests, function (idx, rateChange) {
                            var p = getCoordinates( rateChange.ratingUpdateTimeSeconds, rateChange.newRating );
                            if ( q != null ) {
                                traceLine( ctx, q, p, userColor );
                                if (mouseCoordinates !== null && q.x <= mouseCoordinates.x && mouseCoordinates.x <= p.x) {
                                    currentPosition = {
                                        x: mouseCoordinates.x,
                                        y: q.y + (mouseCoordinates.x - q.x) * (p.y - q.y) / (p.x - q.x)
                                    };
                                } 
                            }
                            q = p;
                            
                            if ( firstPoint === null ) firstPoint = p;
                            lastPoint = p;

                            DrawPoint(ctx, p, userColor);
                        });
                        
                        if (mouseCoordinates !== null && currentPosition === null) {
                            if (Math.abs(mouseCoordinates.x - firstPoint.x) < Math.abs(mouseCoordinates.x - lastPoint.x)) {
                                currentPosition = firstPoint;
                            } else {
                                currentPosition = lastPoint;
                            }
                        }
                        
                        if ( currentPosition !== null ) {
                            specialPoints.push({
                                point: currentPosition,
                                color: userColor,
                                handle: item.handle
                            });
                            //DrawSpecialPoint(ctx, currentPosition, userColor, item.handle);
                        }

                        userCount++;
                    }
                });
                
                $.each(specialPoints, function (key, value) {
                    DrawSpecialPoint(ctx, value.point, value.color, value.handle);
                });
                
                requestAnimationFrame(step);
            });
        }).bind(me));
    }).bind(me) );
})(jQuery);