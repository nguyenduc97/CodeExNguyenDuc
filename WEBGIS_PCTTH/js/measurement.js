function addMeasurement(DistanceMeasurement2D, AreaMeasurement2D) {
	var activeWidget = null;
	document.getElementById("distanceButton").addEventListener("click", function() {
		setActiveWidget(null);
		if (!this.classList.contains("active")) {
			setActiveWidget("distance");
		} else {
			setActiveButton(null);
		}
	});

	document.getElementById("areaButton").addEventListener("click", function() {
		setActiveWidget(null);
		if (!this.classList.contains("active")) {
			setActiveWidget("area");
		} else {
			setActiveButton(null);
		}
	});

	function setActiveWidget(type) {
		switch (type) {
			case "distance":
			activeWidget = new DistanceMeasurement2D({
				view: view,
				container: "addMeasurement",
			});

              // skip the initial 'new measurement' button
              activeWidget.viewModel.newMeasurement();

              setActiveButton(document.getElementById("distanceButton"));
              break;
              case "area":
              activeWidget = new AreaMeasurement2D({
              	view: view,
              	container: "addMeasurement",
              });

              // skip the initial 'new measurement' button
              activeWidget.viewModel.newMeasurement();


              setActiveButton(document.getElementById("areaButton"));
              break;
              case null:
              if (activeWidget) {
              	view.ui.remove(activeWidget);
              	activeWidget.destroy();
              	activeWidget = null;
              }
              break;
          }
      }

      function setActiveButton(selectedButton) {
          // focus the view to activate keyboard shortcuts for sketching
          view.focus();
          var elements = document.getElementsByClassName("active");
          for (var i = 0; i < elements.length; i++) {
          	elements[i].classList.remove("active");
          }
          if (selectedButton) {
          	selectedButton.classList.add("active");
          }
      }
  }