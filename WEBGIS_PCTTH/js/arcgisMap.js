var view;
var pushbasemaps = [];
var options = { query: { f: 'json' }, responseType: 'json' };

function loadMap(Map, MapView, Search, BasemapGallery, Expand, ScaleBar, Fullscreen, Print, Home, Locate, esriRequest, query, on, dom, LayerList, MapImageLayer, GraphicsLayer, FeatureLayer, array, Basemap, Query, Polygon, urlMap) {
    _Map = new Map({});

    view = new MapView({
        container: "viewDiv",
        map: _Map,
        center: [107.57, 16.475],
        zoom: 13,
    });

    addCheckLayer("https://gisportal.svtech.com.vn/portal/rest/services/DDC/DTTM/FeatureServer");

    var scaleBar = new ScaleBar({
        view: view,
        unit: "dual"
    });
    view.ui.add(scaleBar, {
        position: "bottom-right"
    });
    addPopupWindow();
    var homeBtn = new Home({
        view: view
    });
    view.ui.add(homeBtn, "top-left");

    $('.mylocation').on('click', function() {
        var locateBtn = new Locate({
            view: view
        });
        locateBtn.locate();
    })

    var Fullscreen = new Fullscreen({
        view: view
    });
    view.ui.add(Fullscreen, "top-left");

    function addCheckLayer(urlLayer) {
        var checkLink = urlLayer.trim() + "/layers";
        esriRequest(checkLink, options).then(function(response) {
            var res = response.data;
            var reverse = res.layers.length;
            for (var i = reverse - 1; i >= 0; i--) {
                var layer = res.layers[i];
                var temps = new FeatureLayer({
                    url: urlLayer + "/" + layer.id.toString(),
                    outFields: ["*"],
                    visible: true
                });
                _Map.add(temps);
                zoomToLayer(temps);
            }
        });
    }

    function zoomToLayer(layer) {
        setTimeout(function() {
            layer.when(function() {
                return layer.queryExtent();
            }).then(function(response) {
                if (response.count > 0) {
                    var convertExt = Polygon.fromExtent(response.extent);
                    var geo = view.center;
                    geo.x = convertExt.centroid.x;
                    geo.y = convertExt.centroid.y;
                    geo.z = convertExt.centroid.z == undefined ? 0 : convertExt.centroid.z;
                    var minscale = 125000;
                    if (layer.minScale != 0) minscale = layer.minScale;
                    view.goTo({
                        geometry: geo,
                        scale: minscale
                    }, { duration: 500 });
                }
            });
        }, 3000);
    }
    var layerAction = new LayerAction();
    var layerList = new LayerList({
        view: view,
        listItemCreatedFunction: layerAction.defineActions
    }, "ddc_layerList");
    layerAction.triggerActions(layerList);

    function LayerAction() {
        this.defineActions = function(event) {
            var item = event.item;
            item.actionsSections = [
                [{
                    title: "Xem bảng thuộc tính",
                    className: "esri-icon-table",
                    id: "infoTable"
                }]
            ];
        }
        this.triggerActions = function(layerList) {
            layerList.on("trigger-action", function(event) {
                var id = event.action.id;
                if (id === "infoTable") {
                    var allpopup = document.querySelectorAll('.ddc_popup');
                    for (var pp of allpopup) {
                        pp.style.display = "none";
                    }
                    var layer = event.item.layer;
                    _currentLayer = layer;
                    var kq = infoTable.getData(layer);
                    var linetd = document.querySelectorAll('.dgrid');
                    [].slice.call(linetd).forEach(function(lin) {
                        lin.innerHTML = "";
                    });
                }
            });
        }
    }
    view.on("click", function(event) {
        view.hitTest(event).then(viewInfoPopup);

    });
    // view.on("pointer-move", function(event) {
    //     view.hitTest(event).then(function(response) {
    //         if (response.results.length) {
    //             var location = response.results[0].graphic.geometry.centroid;
    //             if (typeof location != "undefined") {
    //                 var x = location.x;
    //                 var y = location.y;
    //                 document.getElementById('SetLocation').innerHTML = "X: " + x.toFixed(3) + " - Y:" + y.toFixed(3);
    //             }
    //         }
    //     });
    // });
    // view.ui.add("showLocationMove", "bottom-right");

    function viewInfoPopup(response) {
        var titleField = response.results[0].graphic.layer;
        var checkFieldInfo = response.results[0].graphic.geometry;
        if (checkFieldInfo !== null) {
            var graphics = response.results[0].graphic;
            var fieldInfo = array.map(graphics.layer.fields, function(field) {
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
            //ẩn hinh anh theo đường
            var ViewImage = "";
            if (titleField.layerId == 0) {
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
            var template = {
                title: titleField.title,
                content: [{
                        type: "fields",
                        fieldInfos: fieldInfo
                    },
                    //View hình ảnh
                    {
                        type: "media", // MediaContentElement
                        mediaInfos: ViewImage
                    },
                    //Xem file 
                    {
                        type: "text",
                        text: ViewFile,
                    },
                    {
                        type: "text",
                        text: htmlTable,
                    },

                ],
                action: "test"
            };
            graphics.layer.popupTemplate = template;
        }
    };
    addESRIBaseMap();

    function addESRIBaseMap() {
        var layer = new MapImageLayer({
            url: "https://gisportal.svtech.com.vn/portal/rest/services/DDC/Basemap_DTTM/MapServer"
        });
        var customBasemap = new Basemap({
            baseLayers: [layer],
            title: "Bản đồ nền mặc định",
            id: "ddc_body_baseMap"
        });
        pushbasemaps.push(customBasemap);

        var basemapGallery = new BasemapGallery({
            source: pushbasemaps,
            view: view
        }, "ddc_body_baseMap");
        if (customBasemap) {
            basemapGallery.activeBasemap = customBasemap;
        }
    }

    function addPopupWindow() {
        var element = document.createElement('div');
        element.id = "btnShowInfoTable";
        element.className = "esri-icon-table esri-widget--button esri-widget esri-interactive";
        element.style.display = 'none';
        element.addEventListener('click', function(evt) {
            document.getElementById('docking-window').style.display = 'block';
            this.style.display = 'none';
        });
        view.ui.add(element, "bottom-left");
    }
    // Where Query 
    var wQuery = new Query({
        outFields: ["*"]
    });

    var linkService = "https://gisportal.svtech.com.vn/portal/rest/services/DDC/DTTM/FeatureServer";
    var linkThuaDat = "https://gisportal.svtech.com.vn/portal/rest/services/DDC/DTTM/FeatureServer/1";
    var optionHTML = '';
    esriRequest(linkThuaDat, options).then(function(response) {
        var listFields = response.data.fields;
        for (var i = 0; i < listFields.length; i++) {
            if (listFields[i].name == "maXa") {
                var listDomain = listFields[i].domain.codedValues;
                if (listDomain.length > 1) {
                    optionHTML += '<option>-- Phường/Xã --</option>';
                }
                for (var j = 0; j < listDomain.length; j++) {
                    optionHTML += '<option value=' + '"' + listDomain[j].code + '"' + '>' + listDomain[j].name + '</option>'
                }
            }
        }
        document.getElementById('sPhuongXa').innerHTML = optionHTML;

    })
    $('.ddc_form_thuadat').on('click', function() {
            var maXa = $('#sPhuongXa option:selected').val();
            var sohieubando = $('.sohieubando')[0].value;
            var sohieuthua = $('.sohieuthua')[0].value;
            var diachithuadat = $('.diachithuadat')[0].value;
            var whereThuaDat = "maXa='" + maXa + "' And ";
            if (sohieubando != "" && sohieuthua != "") {
                if (sohieubando != "") {
                    whereThuaDat += "soHieuBanDo='" + sohieubando + "' AND ";
                }
                if (sohieuthua != "") {
                    whereThuaDat += "soHieuThua='" + sohieuthua + "'";
                }
                if (diachithuadat != "") {
                    whereThuaDat += " And diaChi LIKE N'%" + diachithuadat + "%'"
                }
                wQuery.where = whereThuaDat;
                qThuaDat(wQuery);
            } else {
                alert("Vui lòng nhập dữ liệu");
            }
        })
        // Query Thửa đất
    function qThuaDat(wQuery) {
        var fLayerThuaDat = new FeatureLayer({
            url: linkThuaDat,
        });

        fLayerThuaDat.queryFeatures(wQuery)
            .then(function(results) {
                var checkNullThuaDat = results.features;
                if (checkNullThuaDat.length > 0) {
                    var idresult = results.features[0].attributes.OBJECTID;
                    infoTable.goToFeature(fLayerThuaDat, idresult);
                } else {
                    alert('Dữ liệu không được tìm thấy');
                }
            });
    };

    // Query Giá đất
    function qGiaDat(dieukien, id) {
        var qThuaDat = new FeatureLayer({
            url: linkService + "/" + id,
            outFields: ["*"]
        });
        _currentLayer = qThuaDat;
        infoTable.getData(qThuaDat, dieukien);
    }
    $('.ddc_form_giadat').on('click', function() {
        var tenduong = $('.tenduong')[0].value;
        var whereGiaDat = "TenDuong LIKE N'%" + tenduong + "%'";
        var idLayer = "0";
        qGiaDat(whereGiaDat, idLayer);
    });


    //Search toa do
    $('.ddc_search_toado').on('click', function() {
        var arrToaDox = [];
        var arrToaDoy = [];
        var qrToaDox = document.querySelectorAll(".toadox");
        var qrToaDoy = document.querySelectorAll(".toadoy");
        for (i = 0; i < qrToaDox.length; i++) {
            var keyx = i + 1
            if (qrToaDox[i].value != "") {
                var ToaDox = document.getElementById('toadox' + keyx).value;
                arrToaDox.push(ToaDox);
            }
        }
        for (j = 0; j < qrToaDoy.length; j++) {
            var keyy = j + 1
            if (qrToaDoy[j].value != "") {
                var ToaDoy = document.getElementById('toadoy' + keyy).value;
                arrToaDoy.push(ToaDoy);
            }
        }
        alert('Chức năng đang cập nhật. Vui lòng quay lại sau!');

    })

    // ghi chú màu thửa đất
    var noteLayer = linkService + "/layers";
    esriRequest(noteLayer, options).then(function(response) {
        var res = response.data.layers;
        var htmlNote = '';
        for (var i = 0; i < res.length; i++) {
            var checkNullNote = res[i].drawingInfo.renderer.uniqueValueInfos;
            if (checkNullNote != null) {
                for (var j = 0; j < checkNullNote.length; j++) {
                    htmlNote += '<li><span class="legend-color" style="background-color:rgb(' + checkNullNote[j].symbol.color.toString() + ');"></span>' + checkNullNote[j].label + '</li>'
                }
            }
        }
        document.getElementById('list-legend').innerHTML += htmlNote;
    });
    //
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