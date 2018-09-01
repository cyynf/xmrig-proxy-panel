var miRefresh, wiRefresh, datatable, datatable2, workers = [], naworkers = [];

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key))
            size++;
    }
    return size;
};

function ajaxget(url, callback) {
    $.ajax({
        type: 'GET',
        url: url,
        success: callback,
        dataType: 'json'
    });
}

function formatDate(timestamp) {
    var result = 'N/A';
    if (timestamp <= 0) {
        return result;
    }
    var mistiming = (Math.round(new Date()) - timestamp) / 1000;
    if (mistiming < 1) {
        return '1 seconds ago';
    }
    var arrr = ['years', 'months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];
    var arrn = [31536000, 2592000, 604800, 86400, 3600, 60, 1];
    for (var i = 6; i >= 0; i--) {
        var inm = Math.floor(mistiming / arrn[i]);
        if (inm > 0) {
            result = inm + ' ' + arrr[i] + ' ago';
        } else {
            return result;
        }
    }
    return result;
}

function mainInfoCallback(data) {
    if (data !== null && typeof data === 'object' && Object.size(data) > 0) {
        $('#hashrate').text(data.hashrate.total[0] + ' Kh/s');
        $('#hashrate1h').text(data.hashrate.total[2] + ' Kh/s');
        $('#hashrate12h').text(data.hashrate.total[3] + ' Kh/s');
        $('#acceptedshares').text(data.results.accepted + ' / ' + (data.results.accepted + data.results.rejected + data.results.invalid) + ' (' + Number((data.results.accepted / (data.results.accepted + data.results.rejected + data.results.invalid)) * 100).toFixed(2) + '%)');
        $('#hashes').text(data.results.hashes_total.toLocaleString());
        $('#times').text((data.uptime / 3600).toFixed(2) + ' hours');
        $('#latency').text('Ping: ' + data.results.latency + ' ms');
        $('#avg_time').text('Avg: ' + data.results.avg_time + ' s');
        $('#best').text('Best: ' + data.results.best[0].toLocaleString());
        $('#effort').text((Number((mDiff / data.results.avg_time) / data.hashrate.total[2]) / 10).toFixed(2) + '%');
    }
}

function workersInfoCallback(data) {
    if (data !== null && typeof data === 'object' && Object.size(data) > 0) {
        workers = [];
        naworkers = [];
        var aworkerscount = 0;
        var naworkerscount = 0;
        $.each(data.workers, function (i, worker) {
            var name = '';
            if (worker[0].length > 30) {
                name = '<span data-toggle="tooltip" data-placement="top" title="' + worker[0] + '">' + worker[0].substr(0, 30) + '...</span>';
            } else {
                name = worker[0];
            }
            var workdata = [name, worker[6].toLocaleString(), worker[10] + ' Kh/s', worker[11] + ' Kh/s', formatDate(worker[7])];
            if (parseInt(worker[2]) > 0) {
                if (parseInt(worker[2]) > 1) {
                    workdata[0] = workdata[0] + " x" + worker[2]
                }
                workers.push(workdata);
                aworkerscount++;
            } else {
                naworkers.push(workdata);
                naworkerscount++;
            }
        });
        $('#allworkers').text(aworkerscount + naworkerscount);
        $('#activeworkers').text(aworkerscount);
        $('#notactiveworkers').text(naworkerscount);
        fillTable();
    }
}

function getProxyMainInfo() {
    ajaxget(proxy_url, mainInfoCallback);
    miRefresh = setInterval(function () {
        ajaxget(proxy_url, mainInfoCallback);
    }, 60000);
}

function getProxyWorkersInfo() {
    ajaxget(proxy_url + '/workers.json', workersInfoCallback);
    wiRefresh = setInterval(function () {
        ajaxget(proxy_url + '/workers.json', workersInfoCallback);
    }, 60000);
}

function fillTable() {
    if (datatable !== null && typeof datatable === 'object') {
        datatable.clear();
        datatable.rows.add(workers);
        datatable.draw();
    }
    if (datatable2 !== null && typeof datatable2 === 'object') {
        datatable2.clear();
        datatable2.rows.add(naworkers);
        datatable2.draw();
    }
}

$(document).ready(function () {
    getProxyMainInfo();
    getProxyWorkersInfo();
    datatable = $('#workerstable').DataTable({
        data: workers,
        columns: [
            {title: "Name", className: 'table-center'},
            {title: "Hashes", width: '15%', className: 'table-right'},
            {title: "Hashrate 1h", width: '15%', className: 'table-right'},
            {title: "Hashrate 12h", width: '15%', className: 'table-right'},
            {title: "Last Hash", width: '15%', className: 'table-right'}
        ],
        "order": [[3, "desc"]]
    });
    datatable2 = $('#naworkerstable').DataTable({
        data: naworkers,
        columns: [
            {title: "Name", className: 'table-center'},
            {title: "Hashes", width: '15%', className: 'table-right'},
            {title: "Hashrate 1h", width: '15%', className: 'table-right'},
            {title: "Hashrate 12h", width: '15%', className: 'table-right'},
            {title: "Last Hash", width: '15%', className: 'table-right'}
        ],
        "order": [[3, "desc"]]
    });
});