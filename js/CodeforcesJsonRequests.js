// Singleton que gestiona el request de los JSON al servidor codeforces.com, ya que este solo permite
// una máximo de 5 requests en un intervalo de 1 segundo
var CodeforcesJsonReqests = {
    index: 0,
    lastTime: [0, 0, 0, 0, 0],
    
    JsonRequestManager: function (userList) {
        var me = this;

        return userList.map(function (obj) {
            var dfd        = new jQuery.Deferred();
            var timeToWait = Math.max( 0, 1200 - (jQuery.now() - me.lastTime[ me.index ]));

            setTimeout(function () {
                jQuery.when( jQuery.getJSON( obj.url ))
                    .then( function (data) {
                        dfd.resolve({
                            'handle': obj.handle,
                            'result': data.result
                        });
                    }, function () {
                        dfd.resolve({
                            'handle': obj.handle,
                            'result': []
                        });
                    });
                }, timeToWait);

            me.lastTime[ me.index ] = jQuery.now() + timeToWait;
            if ( ++me.index >= me.lastTime.length ) me.index = 0;

            return dfd;
        });
    },
    
    userRating: function (handleList, successCallback, failureCallback) {
        var me = this;
        jQuery.when.apply( jQuery, me.JsonRequestManager( handleList.map(function (handle) {
            return {
                'handle': handle,
                'url': 'http://codeforces.com/api/user.rating?handle=' + handle + '&jsonp=?'
            }
        }) ) ).then( successCallback, failureCallback );
    },
    
    commingContest: function (successCallback, failureCallback) {
        var me = this;
        
        jQuery.when.apply( jQuery, me.JsonRequestManager( [{ handle: '', url: 'http://codeforces.com/api/contest.list?gym=false&jsonp=?' }] ) )
            .then( successCallback, failureCallback );
    },
    
    userInfo: function (handleList, successCallback, failureCallback) {
        var me = this;
        jQuery.when.apply(jQuery, me.JsonRequestManager([{
            'handle': '',
            'url': "http://codeforces.com/api/user.info?handles=" + handleList.join(';') + "&jsonp=?" }]
        )).then( successCallback, failureCallback );
    }
};
