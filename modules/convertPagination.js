const convertPagination = function (source, currentPage) {

    const totalResult = source.length;
    const perpage = 3;
    const totalPage = Math.ceil(totalResult / perpage);
    if (currentPage > totalPage) {
        currentPage = totalPage;
    }

    const minItem = (perpage * currentPage) - perpage + 1;
    const maxItem = (perpage * currentPage);
    const data = [];
    source.forEach(function (item, i) {
        let itemNum = i + 1;
        if (itemNum >= minItem && itemNum <= maxItem) {
            data.push(item);
        }
    });

    const page = {
        totalPage,
        currentPage,
        hasPre: currentPage > 1,
        hasNext: currentPage < totalPage
    }

    return {
        page,
        data
    }


}
module.exports = convertPagination;