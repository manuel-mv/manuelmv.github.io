(function ($) {
    var handlers = ['thnkndblv', 'alda', 'Gansito144', 'hopkins', 'tomystark', 'Adroyl', 'kenin4', 'magori',
        'positr0nix', 'geovanni', 'almendra', 'zubzero'];
    $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22"+
            encodeURIComponent('http://coj.uci.cu/24h/usersinstitutionrank.xhtml?inst_id=6316')+
            "%22&format=xml'&callback=?",
        function(data){
            function filterData(data){
                data = data.replace(/<?\/body[^>]*>/g,'');
                data = data.replace(/[\r|\n]+/g,'');
                data = data.replace(/<--[\S\s]*?-->/g,'');
                data = data.replace(/<noscript[^>]*>[\S\s]*?<\/noscript>/g,'');
                data = data.replace(/<script[^>]*>[\S\s]*?<\/script>/g,'');
                data = data.replace(/<script.*\/>/,'');
                data = data.replace(/<img[^>]*>/g,'');
                return data;
            }

            if (data.results[0]){
                var page = filterData(data.results[0]);

                var uList = [];

                $.each($(page).find('#user tbody tr'), function (i, item) {
                    var handle = $(item).find('td:nth-child(2)').text();

                    if (handlers.indexOf(handle) != -1) {
                        uList.push({
                            'handle': handle,
                            'ac': $(item).find('td:nth-child(4)').text(),
                            'ac_percent': $(item).find('td:nth-child(5)').text(),
                            'score': $(item).find('td:nth-child(6)').text()
                        });
                    }
                });

                $('<table></table>')
                    .append($('<caption></caption>')
                        .append(spanString('Caribbean Online Judge')))
                    .append($('<thead></thead>')
                        .append($('<tr></tr>')
                            .append($('<th></th>')
                                .css('width', '15px')
                                .text('#'))
                            .append($('<th></th>')
                                .css('width', '100px')
                                .text('Handle'))
                            .append($('<th></th>')
                                .text('AC'))
                            .append($('<th></th>')
                                .text('AC%'))
                            .append($('<th></th>')
                                .text('score'))))
                    .append('<tbody></tbody>')
                    .addClass('ratingTable')
                    .appendTo('#coj');

                $.each(uList, function (i, item) {
                    if (i == 10) return false;

                    var best = parseFloat(uList[0].score);
                    var current = parseFloat(item.score);

                    var blue = best > 0 ? current / best : 0;
                    blue = Math.floor((1.0 - blue) * 70);

                    $('<tr></tr>')
                        .append($('<td></td>')
                            .text(i + 1))
                        .append($('<td></td>')
                            .text(item.handle)
                            .css('font-weight', 'bold')
                            .css('color', 'hsla(' + (260 - blue) + ', 100%, 45%, 0.94)'))
                        .append($('<td></td>')
                            .text(item.ac))
                        .append($('<td></td>')
                            .text(item.ac_percent))
                        .append($('<td></td>')
                            .text(item.score)
                            .css('font-weight', 'bold')
                            .css('color', 'hsla(' + (260 - blue) + ', 100%, 45%, 0.94)'))
                        .appendTo('#coj table tbody');
                });
            } else {
                console.log('Problemas con servidor de CF!');
            }
        }
    );
})(jQuery);