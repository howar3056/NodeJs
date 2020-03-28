$(document).ready(function () {
    $('.deletePost').on('click', function (e) {
        e.preventDefault();
        let id = $(this).data("id");
        let title = $(this).data("title");
        if (confirm('確認是否刪除' + title)) {

            $.ajax({
                url: "/dashboard/article/remove",
                type: 'POST',
                data: {
                    'id': id,
                },
                async: true,
                success: function (data) {
                    console.log("success");
                },
                error: function (data) {
                    console.log("failed");
                }
            }).done(function () {
                window.location = '/dashboard/archives';
            });
        }
    });
});