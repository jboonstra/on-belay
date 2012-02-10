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

// invoke a function on a particular path
function path(path, callback) {
    (document.location.pathname === path) && callback.call();
}

// extract a base project URL from a string
function getProject(str) {
    return str.replace(/(\/projects\/[^\/]+).*/, '$1');
}

// extract a numeric ID from a string
function getID(str) {
    return str.replace(/^[^\d]*(\d+).*/, "$1");
}