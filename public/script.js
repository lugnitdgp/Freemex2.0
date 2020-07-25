function updateStockPrices() {
    $.ajax({
        url: "api/stocks/",
        dataType: 'json',
        success: function(data) {
            // console.log(data);
            let index = 0;
            $('.stock-card').each(function() {
                // console.log($(this).attr("data-name"));
                // var stock = $(this).attr('data-name');
                var price = data[index]['price'];
                var diff = data[index]['diff'];
                diff = (diff * 1)/100;
                price = (price * 1)/100;
                console.log(price);
                console.log(diff);
                var elem = $(this).find('#diff');
                if (diff >= 0) {
                    var diff_html = diff + " <i class=\"fa fa-arrow-up\" aria-hidden=\"true\">";
                    elem.html(diff_html);
                    if (elem.hasClass('down')) {
                        elem.removeClass('down');
                        elem.addClass('up');
                    }
                } else {
                    var diff_html = diff + " <i class=\"fa fa-arrow-down\" aria-hidden=\"true\">";
                    elem.html(diff_html);
                    if (elem.hasClass('up')) {
                        elem.removeClass('up');
                        elem.addClass('down');
                    }
                }
                $(this).find('#price').html("<strong>$</strong> " + price);
                index++;
            });
            var last_updated = new Date(data['last_updated']);
            var now_time = new Date(Date.now());
            time = now_time - last_updated;
            var options = {"month": "short", "day": "2-digit", "year": "numeric", "hour": "2-digit", "minute": "2-digit"};
            var current_time = now_time.toLocaleDateString("en-US", options);
            current_time = current_time.slice(0,3) + "." + current_time.slice(3);
            current_time = current_time.replace("PM", "p.m.");
            current_time = current_time.replace("AM", "a.m.");
            $('#last-updated').html(current_time);
        }
    });
}

$(document).ready(function() {
    var source = new EventSource('/events');
    source.onmessage = function(event) {
        const stocks=JSON.parse(event.data)
        // console.log(stocks)
        updateStockPrices();
    };
})
