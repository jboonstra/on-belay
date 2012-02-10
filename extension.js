$.ajaxSetup({
    headers: {
        'X-CSRF-Token': getCSRFToken(),
        accept: 'text/javascript, text/html, application/xml, text/xml, */*'
    }
});

// link all todo items on the global todo dashboard to their comment pages
path('/todo_lists', function () {
    $('table.todolist').each(function () {
        var project = getProject($(this).find('.todolisttitle a').attr('href'));
        $(this).find('td:nth-child(2)').each(function () {
            var todoID, $input = $(this).find('input[type="checkbox"]');
            if ($input.length) {
                todoID = getID($input.attr('id'));
                if (todoID) {
                    $(this).next('td').find('span.content').wrapInner($(
                        '<a>', 
                        { href: project + '/todo_items/' + todoID + '/comments'}
                    ));
                }
            }
        });
    });
});

// enhance todo conversation pages
path('/projects/*/todo_items/*/comments', function (parts) {
    var todoID = parts[2];
    $.ajax({
        url: '/todo_items/' + todoID + '/edit',
        dataType: 'text',
        type: 'get'
    }).done(function (responseText) {
        var matches = responseText.match(/<form.*\/form>/i),
            $form, $select;
        if (matches) {
            
            // extract the form HTML from the responsetext and jQuerify
            $form = $(matches[0].replace(/\\"/g, '"').replace(/\\n/g, ''));
            
            // gussy up the form a bit and prepare it for use
            $form
                // hide stuff we don't want
                .find('textarea, ul, p.submit span, p.submit a').hide().end()
                
                // tweak the display
                .find('input[type="submit"]').val('Save').end()
                
                // remove inline JS
                .attr('onsubmit', null)
                
                // make 'er look nice
                .addClass('on-belay-assigner')
                
                // catch submits
                .on('submit', function () {
                    $form.addClass('busy');
                    $.ajax({
                        url: $form.attr('action'),
                        type: 'post',
                        dataType: 'text',
                        data: $form.serialize()
                    }).done(function () {
                        document.location.reload();
                    });
                    return false;
                });
            
            // move the select drop-down out, to deal with some HTML issues
            // do this separately since this doesn't chain well with the above
            $form.find('select').prependTo($form.find('p.submit'));
                
            // drop it in place
            $('.page_header .content p').before($form);
        }
    });
});

// invoke a function on a particular path
function path(path, callback) {
    var m = regexpify(path).exec(document.location.pathname);
    if (m) {
        callback.call(this, m);
    }
}

// extract a base project URL from a string
function getProject(str) {
    return str.replace(/(\/projects\/[^\/]+).*/, '$1');
}

// extract a numeric ID from a string
function getID(str) {
    return str.replace(/^[^\d]*(\d+).*/, "$1");
}

function getCSRFToken() {
    return $('meta[name="csrf-token"]').attr('content');
}

// turn a string into a regular expression suitable for matching a pathname
function regexpify(str) {
    str = '^' + str.replace(/\*/g, '([^/]+)').replace(/\//g, '\\/') + '$';
    return new RegExp(str);
}