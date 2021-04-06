function addPrint(Map, Print, Expand, dom, on) {
    view.when(function () {
        // Zoom To Scale
        on(dom.byId("ZoomToScale"), "click", function () {
            var scale = dom.byId("GetValueZoomToScale").value;
            var repscale = scale.replace(/,/g, "");
            view.goTo({
                geometry: view.center,
                scale: repscale
            }, { duration: 1000 });
        });
        var titleExpand = new Expand({
            expandIconClass: "esri-icon-review",
            expandTooltip: "Nhập tỉ lệ",
            view: view,
            content: document.getElementById("titleInputScaleDiv"),
            autoCollapse: false
        });
        if (titleExpand.expanded) {
            titleExpand.collapse();
        }
        view.ui.add(titleExpand, "top-left");

        // Print
        var printMap = new Print({
            view: view,
            printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
        var printExpand = new Expand({
            view: view,
            content: printMap,
            expandTooltip: "In",
            autoCollapse: false
        });
        if (printExpand.expanded) {
            printExpand.collapse();
        }
        view.ui.add(printExpand, "top-left");
    });
};