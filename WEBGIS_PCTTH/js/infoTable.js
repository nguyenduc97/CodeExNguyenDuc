/*global Helper,dojo,_mapData,infoTable*/
function addinfoTable(Map, Expand, FeatureLayer, QueryTask, Query, Grid, OnDemandGrid, ColumnHider, Pagination, ColumnResizer, i18nPagination, Memory, StoreAdapter, Selection, webMercatorUtils, Graphic, GraphicsLayer, array, dom, on, domClass, declare, Extent, Point, Polygon, Polyline, SpatialReference, lang) {
    infoTable = new InfoTable();

    function InfoTable() {
        //biến static
        gridFields = ["*"]; // biến lưu danh sách các trường sẽ hiển thị
        grid = null;
        var _currentEditFeature = null;
        resultFeatures = null; // bảng dữ liệu
        maxRecordCount = 1000;
        dataStore = new StoreAdapter({
            objectStore: new Memory({
                idProperty: "OBJECTID"
            })
        });
        this.initGrid = function() {
            //xóa grid để tránh event lặp
            if (grid != null) {
                grid.destroy();
            }
            //append grid
            var divgrid = document.createElement('div');
            divgrid.setAttribute("id", "grid");
            divgrid.setAttribute("style", "height:100%");
            document.getElementById("infoTableGrid").appendChild(divgrid);

            gridFields = ["*"]; // biến lưu danh sách các trường sẽ hiển thị
            grid = null;
            var _currentEditFeature = null;
            maxRecordCount = 1000;
            dataStore = new StoreAdapter({
                objectStore: new Memory({
                    idProperty: "OBJECTID"
                })
            });

        }
        this.createGrid = function(fields) {
            var that = this;
            that.initGrid();
            var columns = fields.filter(function(field, i) {
                if (gridFields.indexOf(field.name) !== 0) {
                    return field;
                }
            }).map(function(field) {
                if (field.name === "OBJECTID") {
                    return {
                        field: field.name,
                        label: field.name,
                        sortable: true,
                        hidden: true,
                        resizable: true,
                        width: 200
                    };
                } else {
                    return {
                        field: field.name,
                        label: field.alias,
                        sortable: true,
                        resizable: true,
                        width: 200
                    };
                }
            });
            var i18nCustomized = lang.mixin({}, i18nPagination, {
                status: "Tổng cộng: ${total} đối tượng - Hiển thị từ ${start} đến ${end}"
            });
            var MyPagination = declare(Pagination, {
                i18nPagination: i18nCustomized
            });
            grid = new(Grid.createSubclass([Selection, ColumnHider, ColumnResizer, MyPagination]))({
                    columns: columns,
                    pagingLinks: 1,
                    pagingTextBox: true,
                    firstLastArrows: true,
                    pageSizeOptions: [20, 40, 60],
                    rowsPerPage: 20,
                    adjustLastColumn: true
                },
                "grid"
            );
            grid.on("dgrid-select", function() {
                that.selectFeatureFromGrid(event, that);
            });
            grid.on('dgrid-refresh-complete', function() {
                grid.resize();
            });
        }
        this.getcurrentEditFeature = function() {
            return _currentEditFeature == null ? null : _currentEditFeature;
        }
        this.goToFeatureByName = function(name, id) {
            for (var i = 0; i < _Map.allLayers.items.length; i++) {

                if (_Map.allLayers.items[i].title && _Map.allLayers.items[i].title.indexOf(name) >= 0) {
                    var res = _Map.allLayers.items[i];
                    var IT = new InfoTable();
                    IT.goToFeature(res, id);
                    break;
                }
            }
        }

        this.goToFeature = function(featureLayer, id) {
            // query bằng OBJECTID 
            var query = {
                objectIds: [parseInt(id)],
                outFields: ["*"],
                returnGeometry: true
            };

            featureLayer.queryFeatures(query)
                .then(function(results) {
                    var graphics = results.features;
                    var checkGraphic = graphics[0];
                    //checkGraphic là đối tượng hiện thị
                    //selectGraphic là vùng bao
                    _currentEditFeature = checkGraphic;
                    var selectedGraphic = null;
                    //var gettype = checkGraphic.layer.fields;
                    var gettype = featureLayer.fields;
                    checkGraphic.attributes = Object.keys(checkGraphic.attributes)
                        .filter(function(key) {
                            return (gridFields.indexOf(key) !== 0);
                        })
                        .reduce(function(obj, key) {
                            obj[key] = checkGraphic.attributes[key];
                            for (var j = 0; j < gettype.length; j++) {
                                if (gettype[j].name === key) {
                                    if (gettype[j].domain != null && gettype[j].domain.codedValues !== null) {
                                        gettype[j].domain.codedValues.forEach(function(domain) {
                                            if (domain.code === checkGraphic.attributes[key]) {
                                                obj[key] = domain.name;
                                            }
                                        });
                                    }
                                }
                            }
                            return obj;
                        }, {});
                    var fieldInfos = array.map(featureLayer.fields,
                        function(field) {
                            if (field.alias !== "OBJECTID") {
                                return {
                                    "fieldName": field.name,
                                    "label": field.alias,
                                    "visible": true
                                }
                            } else {
                                return {
                                    "fieldName": field.name,
                                    "label": field.alias,
                                    "visible": false
                                }
                            }
                        });
                    var action = [];
                    //ẩn hinh anh theo đường
                    var ViewImage = "";
                    if (checkGraphic.layer.layerId == 0) {
                        ViewImage = [{
                                title: "<b>Tuyến đường</b>",
                                type: "image",
                                caption: "hình ảnh liên quan",
                                value: {
                                    sourceURL: ""
                                }
                            },
                            {
                                title: "<b>Tuyến đường</b>",
                                caption: "hình ảnh liên quan",
                                value: {
                                    sourceURL: ""
                                }
                            }
                        ]
                    } else {
                        ViewImage = [{
                                title: "<b>Giấy chứng nhận quyền sử dụng đất</b>",
                                type: "image",
                                caption: "hình ảnh liên quan",
                                value: {
                                    sourceURL: "https://tphcm.dangcongsan.vn/DATA/72/2020/09/giay_chung_nhan_quyen_su_dung_dat-08_54_31_770.jpg"
                                }
                            },
                            {
                                title: "<b>Giấy chứng nhận quyền sử dụng đất</b>",
                                caption: "hình ảnh liên quan",
                                value: {
                                    sourceURL: "https://raovatbds.vn/wp-content/uploads/2019/10/%C4%90%E1%BA%A5t-s%E1%BB%95-h%E1%BB%93ng.jpg"
                                }
                            }
                        ]
                    }
                    //ẩn hinh anh theo đường
                    var popupTemplate = {
                        title: "<b>" + graphics[0].layer.title + "</b>",
                        content: [{
                                type: "fields",
                                fieldInfos: fieldInfos
                            },
                            //View hình ảnh
                            {
                                type: "media", // MediaContentElement
                                mediaInfos: ViewImage,
                            },
                            //Xem file 
                            {
                                type: "text",
                                text: ViewFile,
                            },
                            {
                                type: "text",
                                text: htmlTable,
                            }
                        ],
                        actions: action
                    }
                    var setgeometry;
                    if (checkGraphic.geometry.type === "point") {
                        checkGraphic.popupTemplate = popupTemplate;
                        setgeometry = new Point({
                            x: checkGraphic.geometry.x,
                            y: checkGraphic.geometry.y,
                            z: (checkGraphic.geometry.z != undefined) ? checkGraphic.geometry.z : 0,
                            spatialReference: view.spatialReference
                        });
                        selectedGraphic = new Graphic({
                            geometry: setgeometry,
                            symbol: {
                                type: "simple-marker",
                                color: [0, 0, 0, 0],
                                outline: {
                                    color: "#ff5d00",
                                    width: 4
                                }
                            }
                        });
                    } else if (checkGraphic.geometry.type === "polyline") {
                        checkGraphic.popupTemplate = popupTemplate;
                        setgeometry = new Polyline({
                            spatialReference: view.spatialReference,
                            paths: checkGraphic.geometry.paths
                        });
                        selectedGraphic = new Graphic({
                            geometry: setgeometry,
                            symbol: {
                                type: "simple-line",
                                color: [255, 93, 0],
                                width: 4
                            }
                        });
                    } else if (checkGraphic.geometry.type === "polygon") {
                        checkGraphic.popupTemplate = popupTemplate;
                        setgeometry = new Polygon({
                            spatialReference: view.spatialReference,
                            rings: checkGraphic.geometry.rings
                        });
                        selectedGraphic = new Graphic({
                            geometry: setgeometry,
                            symbol: {
                                type: "simple-fill",
                                color: [255, 93, 0],
                                width: 4
                            }
                        });
                    }
                    view.graphics.add(selectedGraphic);
                    var x;
                    var y;
                    var z;
                    var geo = view.center;
                    var mid;
                    var minscale = 125000;
                    if (featureLayer.minScale != 0) minscale = featureLayer.minScale;
                    if (checkGraphic.geometry.type === "point") {
                        x = checkGraphic.geometry.x;
                        y = checkGraphic.geometry.y;
                        z = checkGraphic.geometry.z;
                        geo.x = x;
                        geo.y = y;
                        geo.z = z == undefined ? 0 : z;
                        view.goTo({
                            geometry: geo,
                            scale: minscale
                        });
                        view.goTo({
                            geometry: geo,
                            scale: minscale
                        }, { duration: 2000 }).then(function() {
                            //selectedGraphic.geometry = geo;
                            checkGraphic.geometry = geo;
                            view.popup.open({
                                location: geo,
                                features: [checkGraphic]
                            });
                        });
                    } else if (checkGraphic.geometry.type === "polyline") {
                        mid = Math.round(checkGraphic.geometry.paths[0].length / 2);
                        x = checkGraphic.geometry.paths[0][mid][0];
                        y = checkGraphic.geometry.paths[0][mid][1];
                        z = checkGraphic.geometry.paths[0][mid][2];
                        geo.x = x;
                        geo.y = y;
                        geo.z = z == undefined ? 0 : z;
                        view.goTo({
                            geometry: geo,
                            scale: minscale
                        }, { duration: 2000 }).then(function() {
                            checkGraphic.geometry = geo;
                            view.popup.open({
                                location: geo,
                                features: [checkGraphic]
                            });
                        });
                    } else if (checkGraphic.geometry.type === "polygon") {
                        x = checkGraphic.geometry.centroid.x;
                        y = checkGraphic.geometry.centroid.y;
                        z = checkGraphic.geometry.centroid.z;
                        geo.x = x;
                        geo.y = y;
                        geo.z = z == undefined ? 0 : z;
                        view.goTo({
                            geometry: geo,
                            scale: minscale
                        }, { duration: 2000 }).then(function() {
                            checkGraphic.geometry = geo;
                            view.popup.open({
                                location: geo,
                                features: [checkGraphic]
                            });
                        });
                    }
                });

        }
        this.selectFeatureFromGrid = function(event, that) {
            view.graphics.removeAll();
            view.popup.close();
            var that = this;
            // lấy giá trị OBJECTID khi click row 
            var row = event.rows[0];
            var id = row.data.OBJECTID;
            var layerId = _currentLayer != null ? _currentLayer.layerId : "";
            var featureLayer = new FeatureLayer("https://gisportal.svtech.com.vn/portal/rest/services/DDC/DTTM/FeatureServer" + "/" + layerId, { "outFields": ["*"] });
            for (var i = 0; i < _Map.allLayers.length; i++) {
                var gettomap = _Map.allLayers.items[i];
                if (gettomap.type === "feature") {
                    if (gettomap.layerId === layerId) {
                        featureLayer = _Map.allLayers.items[i];
                    }
                }
            }
            that.goToFeature(featureLayer, id);
        }

        this.getData = function(layer, wherelayer) {
            var that = this;
            that.doClear();
            var querytask = new QueryTask({
                url: layer.url + "/" + layer.layerId
            });
            var featureLayer = new FeatureLayer(layer.url + "/" + layer.layerId, { "outFields": ["*"] });
            for (var i = 0; i < _Map.allLayers.length; i++) {
                var gettomap = _Map.allLayers.items[i];
                if (gettomap.type === "feature") {
                    if (gettomap.layerId === layer.layerId) {
                        featureLayer = _Map.allLayers.items[i];
                    }
                }
            }
            var where;
            if (wherelayer != null || typeof wherelayer != "undefined") where = wherelayer;
            else if (layer.definitionExpression) where = layer.definitionExpression;
            else where = "1 = 1";
            var params = new Query({
                returnGeometry: true,
                where: where,
                outFields: ["*"]
            });
            try {
                querytask.executeForCount(params).then(function(count) {
                    params.objectIds = null;
                    if (count > 0) {
                        return querytask.executeForIds(params);
                    } else {
                        console.log("Lớp dữ liệu hiện tại không có dữ liệu!");
                        that.createGrid(layer.fields, true);
                        that.showinfoTable();
                    }
                }).then(function(results) {
                    return that.resultToFeatureSet(featureLayer, results, where);
                }).then(function(featureSets) {
                    return that.showTable(layer, featureSets);
                });
            } catch (error) {
                console.log("Error ", error);
            }
        }
        this.getDataFromObjects = function(layer, results) {
            var where = "1 = 1";
            var that = this;
            that.doClear();
            _currentLayer = layer;
            var featureLayer = new FeatureLayer(layer.url + "/" + layer.layerId, { "outFields": ["*"] });
            for (var i = 0; i < _Map.allLayers.length; i++) {
                var gettomap = _Map.allLayers.items[i];
                if (gettomap.type === "feature") {
                    if (gettomap.layerId === layer.layerId) {
                        featureLayer = _Map.allLayers.items[i];
                    }
                }
            }
            try {
                if (results.length < 0) {
                    console.log("Lớp dữ liệu hiện tại không có dữ liệu!");
                    that.createGrid(layer.fields, true);
                    that.showinfoTable();
                    return;
                }
                that.resultToFeatureSet(featureLayer, results, where).then(function(featureSets) {
                    return that.showTable(layer, featureSets);
                });
            } catch (error) {
                console.log("Error ", error);
            }
        }
        this.resultToFeatureSet = function(featureLayer, results, where) {
            if (results != null) {
                var objectIdsArray = results;
                var featuresTotal = objectIdsArray.length;
                var pageCount = Math.ceil(featuresTotal / maxRecordCount) + 1;
                var resultPages = [];
                for (var i = 1; i < pageCount; i++) {
                    var checkrecord = (i * maxRecordCount);
                    if (checkrecord > featuresTotal) {
                        resultPages.push(featuresTotal);
                    } else {
                        resultPages.push(i * maxRecordCount);
                    }
                }
                var featuresProcessed = 0;
                return Promise.all(resultPages.map(function(resultPageStart) {
                    var queryallvalue = new Query();
                    queryallvalue.where = where,
                        queryallvalue.outFields = ["*"];
                    queryallvalue.returnGeometry = true;
                    queryallvalue.objectIds = objectIdsArray.slice(featuresProcessed, resultPageStart);
                    featuresProcessed += maxRecordCount;
                    return featureLayer.queryFeatures(queryallvalue);
                }));
            }

        }
        this.showTable = function(layer, featureSets) {
            var that = this;
            if (typeof(featureSets) !== "undefined") {
                var features = [];
                featureSets.forEach(function(featureSet) {
                    features = features.concat(featureSet.features);
                });
                var graphics = features;
                var fields = [];
                fields = layer.fields;
                if (fields == null) fields = featureSets[0].fields;
                if (graphics.length > 0) {
                    resultFeatures = features;
                }
                that.createGrid(fields);
                var data = that.returnDataTable(graphics, fields);
                dataStore.objectStore.data = data;
                grid.set("_started", true);
                grid.set("collection", dataStore);
                that.showinfoTable();
            }
        }
        this.returnDataTable = function(resultFeatures, entry) {
            return resultFeatures.map(function(feature) {
                var getattributes = Object.keys(feature.attributes)
                    .filter(function(key) {
                        return (gridFields.indexOf(key) !== 0);
                    })
                    .reduce(function(obj, key) {
                        obj[key] = feature.attributes[key] == null ? "" : feature.attributes[key];
                        for (var j = 0; j < entry.length; j++) {
                            if (entry[j].name === key) {
                                if (entry[j].type === "esriFieldTypeDate" || entry[j].type === "date") {
                                    if (feature.attributes[key] !== null) {
                                        //obj[key] = helper.setDate(feature.attributes[key]);
                                    }
                                } else if (entry[j].domain != null) {
                                    if (entry[j].domain.codedValues !== null) {
                                        entry[j].domain.codedValues.forEach(function(domain) {
                                            if (domain.code === feature.attributes[key]) {
                                                obj[key] = domain.name;
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        return obj;
                    }, {});
                var shape = '';
                var defaultZ;
                if (feature.layer.hasZ) defaultZ = 0;
                else defaultZ = undefined;
                if (feature.geometry !== null) {
                    if (feature.geometry.type === "point") {
                        shape = "(" + (feature.geometry.x === undefined ? 0 : feature.geometry.x) + " " + (feature.geometry.y === undefined ? 0 : feature.geometry.y) + " " + (feature.geometry.z === undefined ? 0 : feature.geometry.z) + ")";
                    } else if (feature.geometry.type === "polyline") {
                        var pathsstring = '';
                        if (defaultZ != undefined)
                            feature.geometry.paths.forEach(function(ringInPaths) {
                                ringInPaths.forEach(function(pointInPath) {
                                    if (pointInPath[2] == undefined) pointInPath.push(defaultZ);
                                    if (pathsstring !== '') pathsstring += ', ';
                                    pathsstring += pointInPath[0] + " " + pointInPath[1] + " " + pointInPath[2];
                                });
                            });
                        shape = "(" + pathsstring + ")";
                    } else if (feature.geometry.type === "polygon") {
                        var ringsstring = '';
                        if (defaultZ != undefined)
                            feature.geometry.rings.forEach(function(ringInRings) {
                                ringInRings.forEach(function(pointInRing) {
                                    if (pointInRing[2] == undefined) pointInRing.push(defaultZ);
                                    if (ringsstring !== '') ringsstring += ', ';
                                    ringsstring += pointInRing[0] + " " + pointInRing[1] + " " + pointInRing[2];
                                });
                            });
                        shape = "(" + ringsstring + ")";
                    }
                }
                var getvalue = Object.assign(
                    getattributes, {
                        SHAPE: shape
                    });
                return getvalue;
            });

        }

        this.doClear = function() {
            if (grid) {
                dataStore.objectStore.data = {};
                grid.set("collection", dataStore);
            }
            view.graphics.removeAll();
            view.popup.visible = false;
        }
        this.showinfoTable = function() {
            var node = document.getElementById('docking-window');
            if (node.style.display !== "block") node.style.display = "block";
        }
        var dome = dom.byId("cleardrig");
        if (dome != null) on(dome, "click", function() {
            _currentEditFeature = null;
            view.graphics.removeAll();
            view.popup.visible = false;
        });

        this.getFeatureObjects = function(features) {
            var featureObjs = [];
            for (var i = 0; i < features.length; i++) {
                var currFeat = features[i];
                var graphic = Graphic.fromJSON(currFeat);
                featureObjs.push(graphic);
            }
            return featureObjs;
        }
        this.getAllFeature = function(layer, params) {
            var that = this;
            var querytask = new QueryTask({
                url: layer.url + "/" + layer.layerId
            });
            var featureLayer = new FeatureLayer(layer.url + "/" + layer.layerId, { "outFields": ["*"] });
            for (var i = 0; i < _Map.allLayers.length; i++) {
                var gettomap = _Map.allLayers.items[i];
                if (gettomap.type === "feature") {
                    if (gettomap.layerId === layer.layerId) {
                        featureLayer = _Map.allLayers.items[i];
                    }
                }
            }
            try {
                return querytask.executeForCount(params).then(function(count) {
                    params.objectIds = null;
                    if (count > 0) {
                        return querytask.executeForIds(params);
                    }
                    return [];
                }).then(function(results) {
                    var wheretask = params.where;
                    return that.resultToFeatureSet(featureLayer, results, wheretask);
                });
            } catch (error) {
                console.log("Error ", error);
            }
        }
    }


    var ViewFile = '<hr><div class="esri-popup-renderer__attachments esri-popup-renderer__content-element">' +
        '<div class="esri-popup-renderer__attachments-title">Hồ sơ thửa đất:</div>' +
        '<ul>' + '<a href="http://103.77.167.158:3569/hoso/nghi-dinh-43-2014-nd-cp-huong-dan-luat-dat-dai.pdf" target="_blank">Nghi-dinh-43-2014-luat-dat-dai.pdf<span class="esri-icon-hollow-eye" style="display: inline-block; float: right;padding-right: 20px;"></span></a><span class="esri-icon-arrow-down" style="display: inline-block; float: right;padding-right: 10px;cursor: no-drop;"></span>' + '<br>' +
        '<a href="http://103.77.167.158:3569/hoso/nghi-dinh-43-2014-nd-cp-huong-dan-luat-dat-dai.doc" target="_blank">Nghi-dinh-43-2014-luat-dat-dai.doc<span class="esri-icon-hollow-eye" style="display: inline-block; float: right;padding-right: 20px;"></span></a><span class="esri-icon-arrow-down" style="display: inline-block; float: right;padding-right: 10px;cursor: no-drop;"></span>' + '<br>' +
        '<a href="https://vanbanphapluat.co/larger/1989/07/14/9146_201-qd-dktk.png" target="_blank">Quyết định.png <span class="esri-icon-hollow-eye" style="display: inline-block; float: right;padding-right: 20px;"></span></a><span class="esri-icon-arrow-down" style="display: inline-block; float: right;padding-right: 10px;cursor: no-drop;"></span>' + '<br>' +
        '<a href="https://batdongsanquocha.vn/data/upload/1542686724-99.7-Phu-Huu-quan-9.jpg" target="_blank">Bản đồ hiện trạng vị trí.jpg<span class="esri-icon-hollow-eye" style="display: inline-block; float: right;padding-right: 20px;"></span></a><span class="esri-icon-arrow-down" style="display: inline-block; float: right;padding-right: 10px;cursor: no-drop;"></span>' + '</ul>' +
        '</div>'

    var htmlTable = '<hr><div class="esri-popup-renderer__attachments-title" style="text-align: center; font-weight: 600;">Bảng kê hệ tọa độ(VN2000)</div>' +
        '<table class="esri-widget__table" style="text-align: center;"><tbody>' +
        '<tr><th class="esri-feature__field-header" style="width:0%; text-align: center;">Số hiệu gốc thửa</th><th class="esri-feature__field-header" style="width:0%; text-align: center;">X(m)</th><th class="esri-feature__field-header" style="width:0%; text-align: center;">Y(m)</th><th class="esri-feature__field-header" style="width:0%; text-align: center;">S(m)</th>' +
        '</tr><tr><td class="esri-feature__field-data" style="width:0%;">1</td><td class="esri-feature__field-data" style="width:0%;">561510.956 </td><td class="esri-feature__field-data" style="width:0%;">1817099.898</td><td class="esri-feature__field-data" style="width:0%;"></td></tr>' +
        '<tr><td class="esri-feature__field-data" style="width:0%;">2</td><td class="esri-feature__field-data" style="width:0%;">754632.25 </td><td class="esri-feature__field-data" style="width:0%;">1345246.85</td><td class="esri-feature__field-data" style="width:0%;">62.66</td></tr>' +
        '<tr><td class="esri-feature__field-data" style="width:0%;">3</td><td class="esri-feature__field-data" style="width:0%;">985462.11 </td><td class="esri-feature__field-data" style="width:0%;">142527.366</td><td class="esri-feature__field-data" style="width:0%;">22.85</td></tr>' +
        '<tr><td class="esri-feature__field-data" style="width:0%;">4</td><td class="esri-feature__field-data" style="width:0%;">658462.958 </td><td class="esri-feature__field-data" style="width:0%;">2574863.898</td><td class="esri-feature__field-data" style="width:0%;">62.66</td></tr>' +
        '<tr><td class="esri-feature__field-data" style="width:0%;">1</td><td class="esri-feature__field-data" style="width:0%;">561510.956 </td><td class="esri-feature__field-data" style="width:0%;">1817099.898</td><td class="esri-feature__field-data" style="width:0%;">20.35</td></tr>' +
        '</tbody></table>';
}