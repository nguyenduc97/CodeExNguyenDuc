function addSearchBox(Search) {
	var searchWidget = new Search({
		view: view
	});

	view.ui.add(searchWidget, {
		position: "top-right"
	});
}