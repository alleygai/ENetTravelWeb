
/*
数据存储：
1. 原始数据存储
2. markers 打点的数据存储
3. flightPaht 连线的数据存储
4. inforwindows 信息弹窗数据存储
5. openedWindow 已打开的弹窗

功能：（通过传参，执行功能；连线或打点的样式，给默认的，同时可以指定新的。）
1. 打点
2. 连线
3. 弹窗

多个图层叠加：
1. 地图本身为同一个
2. 地图描点
3. 打新点，连线
4. 移除某些点
5. 移除某些连线
6. 更改连线为高亮（直接删除，再以高亮显示）


剥离业务与地图本身功能，支持回调。

*/

define("common/ui/map/QyMap", function () {
    var $ = jQuery;

    var QyMap = {};
    QyMap = function () {
        this.mapDivId = '';	//地图显示的容器ID

        this.map = '';
        this.coordinates = [];
        this.bounds = [];
        this.markers = [];
        this.lables = [];
        this.infowindows = [];
        this.flightPath = [];
        this.openedWindow = [];

        this.searchTimer = 0;
    }

    QyMap.prototype = {
        //初始化地图，可以指定地图的中心显示点centerLatLng={lat:10, lng: 20};
        initMap: function (mapDivId, centerLatLng) {
            var myLatlng, lat = 39.92, lng = 116.46;
            if (centerLatLng != '' && typeof centerLatLng === 'object') {
                lat = centerLatLng.lat;
                lng = centerLatLng.lng;
            }


            myLatlng = new google.maps.LatLng(lat, lng);

            var myOptions = {
                maxZoom: 19,
                zoom: 3,
                center: myLatlng,
                mapTypeControl: true,
                scaleControl: true,
                mapTypeControlOptions: {
                    position: google.maps.ControlPosition.TOP_RIGHT //控制地图 “地图|卫星”分类 的显示位置
                },
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP //控制地图 zoom 缩放控制组件  的显示位置
                },
                panControl: false,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            this.mapDivId = mapDivId;
            this.map = new google.maps.Map(document.getElementById(this.mapDivId), myOptions);

        },


        //设置坐标和弹窗,自适应等信息
        formatMarkerData: function (data) {
            var i = 0, thiz = this, tmpMarkers = {}, markers = [], bounds = [], coordinates = [];

            $.each(data, function (k, v) {
                if (v.lat && v.lng && (v.lat != 0 || v.lng != 0)) {
                    var latlng = new google.maps.LatLng(v.lat, v.lng);
                    bounds.push(latlng);
                    coordinates.push(latlng);
                    thiz.bounds.push(latlng);

                    var tmpKey = v.lat + '_' + v.lng;
                    if (!tmpMarkers[tmpKey]) {
                        tmpMarkers[tmpKey] = 1;
                        v.name = v.name || '';
                        v.__HTML__ = v.__HTML__ || '';
                        markers.push({ latlng: latlng, position: i, title: v.name, __HTML__: v.__HTML__, id: v.id, subdata: v });


                    }
                }

                i = i + 1;
            });

            this.coordinates = coordinates;

            return { markers: markers, bounds: bounds, coordinates: coordinates };
        },

        //设置新的路线信息
        formatFlightPathData: function (coordinates, lineConfig) {
            var linePath,
				flightPath = [],
				polylineConfig = {
				    path: coordinates,
				    strokeColor: "#FF0000",
				    strokeOpacity: 0.5,
				    strokeWeight: 5
				};

            polylineConfig = $.extend(polylineConfig, lineConfig);
            linePath = new google.maps.Polyline(polylineConfig);
            flightPath.push(linePath);

            return flightPath;
        },

        //删除历史的marker
        removeMarker: function (markers) {
            var thiz = this, tmpMarkers,
				lastOpenedQyerid = thiz.getLastOpenedInfoWindow();

            tmpMarkers = (typeof markers !== 'undefined') ? markers : thiz.markers;
            $.each(tmpMarkers, function (tmpk1, tmpv1) {

                //如果该marker的InfoWindow打开时,就别删除它
                if (lastOpenedQyerid > 0 && tmpv1.infowindow && tmpv1.infowindow.__qyerid__ == lastOpenedQyerid) return true;

                if (tmpv1.lableMarker) {
                    try {
                        tmpv1.lableMarker.onRemove();
                    } catch (err) {

                    }
                }
                tmpv1.setMap(null);

            });
        },


        //删除历史的连线
        removeFlightPath: function (flightPath) {
            var thiz = this, tmpFlightPath;

            tmpFlightPath = (typeof flightPath !== 'undefined') ? flightPath : thiz.flightPath;
            $.each(tmpFlightPath, function (k, v) {
                if (v) {
                    v.setMap(null);
                }
            });
        },

        //地图自定义叠加图层, 有返回值
        drawSelfLableMarker: function (mapMarkers, lableConfig) {
            var thiz = this,
				tmpLables = [];

            $.each(mapMarkers, function (k1, v1) {
                var lable = new QyMap.LableMarker(thiz.map, v1, lableConfig);
                tmpLables.push(lable);
            });

            thiz.lables = tmpLables;
            return tmpLables;
        },

        //删除自定义叠加图层 
        removeSelfLableMarker: function (lables) {
            var thiz = this;

            lables = lables || thiz.lables;
            $.each(lables, function (k, v) {
                v.onRemove();
            });
        },

        //获取打开infoWindow窗口对应的marker对像
        getOpenedInfoWinMarker: function () {
            var thiz = this,
				marker = '',
				qyerid = thiz.getLastOpenedInfoWindow();

            $.each(thiz.markers, function (k, v) {
                if (v.infowindow && v.infowindow.__qyerid__ == qyerid) {
                    marker = v;
                }
            });

            return marker;
        },

        //获取最后一个打开的infowindow
        getLastOpenedInfoWindow: function () {
            var qyerid = 0;
            if (this.openedWindow != '') {
                qyerid = this.openedWindow[0];
                qyerid = qyerid.__qyerid__;
            }
            return qyerid;
        },

        //删除当前打开infowindow的marker
        removeInfoWindowMarker: function (marker) {
            if (marker.lableMarker) {
                try {
                    marker.lableMarker.onRemove();
                } catch (err) {

                }
            }
            marker.setMap(null);

            this.openedWindow = [];
        },

        //
        /**
		 *地图打点marker
		 * @param: returnType 默认返回自然序号数组;returnType==json，返回以id为key的json
		 */
        drawMarker: function (mapMarkers, markerConfig, returnType) {
            var thiz = this,
				markerArray = [];
            markerJson = {};
            markerSize = mapMarkers.length,
            c = {
                showInfoWindow: 1,
                showLableMarker: true,
                lableConfig: {}
            };

            c = $.extend(c, markerConfig);

            var lastOpenedQyerid = thiz.getLastOpenedInfoWindow();
            $.each(mapMarkers, function (k1, v1) {

                (function (k, v, c) {
                    var tmpMarker = null, mapIcon = '', z_index = 99999;

                    //如果有marker点的InfoWindow处于打开状态,则该marker点存在. 有相同的marker点,就不划
                    if (lastOpenedQyerid > 0 && lastOpenedQyerid == v1.id) {
                        tmpMarker = thiz.getOpenedInfoWinMarker();
                        thiz.markers.push(tmpMarker);
                        markerArray.push(tmpMarker);
                        markerJson[v.id] = tmpMarker;
                        return true;
                    }

                    mapIcon = (typeof c.getMapIconCb === 'function') ? c.getMapIconCb : thiz.getMapIcon;
                    tmpMarker = new google.maps.Marker({
                        position: v.latlng,
                        //animation: google.maps.Animation.DROP, //marker点，从上掉在指定位置动画效果
                        map: thiz.map,
                        title: v.title,
                        icon: mapIcon(markerSize, v.position, v.subdata)
                    });
                    z_index = typeof c['z-index'] != 'undefined' ? c['z-index'] : z_index;
                    tmpMarker.setZIndex(z_index);

                    //定义hover事件，移动到marker上和移出的事件
                    if (typeof c.markerHoverCb === 'function') {
                        c.markerHoverCb(tmpMarker, v);
                    }

                    var isHaveInfoWindow = (c.showInfoWindow && v && v.__HTML__ != '') ? true : false; //是否显示infoWindow

                    if (c.showLableMarker) {
                        var a = new QyMap.LableMarker(thiz.map, v, c.lableConfig, isHaveInfoWindow);
                        tmpMarker.lableMarker = a;
                    }

                    //如果信息窗口有值,则显示
                    if (isHaveInfoWindow) {
                        var infowindow = new google.maps.InfoWindow({
                            content: '<div style="width:255px;">' + v.__HTML__ + "</div>"
                        });
                        infowindow.__qyerid__ = v.id;
                        tmpMarker.infowindow = infowindow;
                    }

                    google.maps.event.addListener(tmpMarker, "click", function () {

                        if (typeof c.markerClickCb === 'function') {
                            c.markerClickCb(tmpMarker, v);
                        }

                        if (isHaveInfoWindow) {
                            //在打开一个新的InfoWindow前,关闭掉其它已打开的Infowindow
                            if (thiz.openedWindow) {
                                $.each(thiz.openedWindow, function (tmpkk, tmpvv) {
                                    tmpvv.close();
                                });
                                thiz.openedWindow = [];
                            }

                            //打开新的InfoWindow
                            infowindow.open(thiz.map, tmpMarker);
                            thiz.infowindows.push(infowindow);
                            thiz.openedWindow.push(infowindow);
                        }
                    });

                    if (isHaveInfoWindow) {
                        google.maps.event.addListener(tmpMarker, "closeclick", function () {
                            infowindow.close();
                        });
                    }

                    thiz.markers.push(tmpMarker);
                    markerArray.push(tmpMarker);
                    markerJson[v.id] = tmpMarker;

                })(k1, v1, c);

            });

            if (typeof returnType !== 'undefined' && returnType == 'json') return markerJson;
            return markerArray;
        },

        //两点之间的连线
        drawPolyLine: function (flightPath) {
            var thiz = this;
            $.each(flightPath, function (k, v) {
                v.setMap(thiz.map);

                thiz.flightPath.push(v);
            });
        },

        //在map当前可视的区域内显示出对应的地图标记
        fitBounds: function (bounds) {
            var mapBounds = new google.maps.LatLngBounds();
            $.each(bounds, function (i, v) {
                mapBounds.extend(v);
            });

            this.map.fitBounds(mapBounds);
        },

        //获取getBounds
        getBounds: function () {
            return this.map.getBounds();
        },

        //获取marker Icon
        getMapIcon: function (markerSize, i, subdata) {
            var iconObj = '', point, size, icon;

            point = new google.maps.Point(0, 32 * i); //icon的显示位置,图片精灵
            size = new google.maps.Size(27, 32);  //icon的尺寸
            icon = "http://static.qyer.com/images/plan2/p_2_2/map_ico.png";
            iconObj = new google.maps.MarkerImage(icon, markerSize, point)


            return iconObj;
        },


        //给地图绑定事件,鼠标移动地图时,触发事件
        bindMapMoveEvent: function (cbfun) {
            var thiz = this;

            google.maps.event.addListener(thiz.map, "idle", function () {
                if (typeof cbfun == 'function') {
                    if (thiz.searchTimer > 0) {
                        clearTimeout(this.searchTimer);
                    }
                    thiz.searchTimer = setTimeout(cbfun, 10);
                }
            });
        },

        //给地图绑定事件,fitbounds完成后,触发事件
        bindBoundsChanged: function (cbfun) {
            var thiz = this;

            google.maps.event.addListener(thiz.map, "bounds_changed", function () {
                if (typeof cbfun == 'function') {
                    cbfun();
                }
            });
        },

        //设置中心点
        setCenterPos: function (lat, lng) {
            newCenter = new google.maps.LatLng(lat, lng);
            this.map.panTo(newCenter);
        },

        //移动地图中心点位置
        moveCenterPos: function (moveW, coordinates) {

            var cLng, newCenter, zoom, rate, diff,
				thiz = this,
				cLatLng = this.map.getCenter();

            //fromContainerPixelToLatLng方法，必须要通过继承实现
            function MapOverView(map, point) {
                this.point = point;
                this.setMap(map);
            }
            MapOverView.prototype = new google.maps.OverlayView();
            MapOverView.prototype.draw = function () {
                return false;
            }
            MapOverView.prototype.onAdd = function () {
                var aPoint, proj = this.getProjection();
                aPoint = proj.fromContainerPixelToLatLng(this.point);
                return aPoint;
            }

            var aPoint, mView, point;
            point = new google.maps.Point(800, 150);
            mView = new MapOverView(thiz.map, point);
            aPoint = mView.onAdd();

            var v_coordinates = (typeof coordinates !== 'undefined') ? coordinates : this.coordinates;
            var leftLng = '', rightLng = '';

            $.each(v_coordinates, function (k, v) {
                var lng = v.lng();
                if (leftLng == '') {
                    leftLng = lng;
                    rightLng = lng;
                }
                if (leftLng > lng) {
                    leftLng = lng;
                }

                if (rightLng < lng) {
                    rightLng = lng;
                }
            });

            var moveLng = aPoint.lng() - leftLng;
            var newCenter, newCenterLng = cLatLng.lng() - moveLng;
            var bfBounds = this.map.getBounds();
            var BfNorthEast = bfBounds.getNorthEast();

            newCenter = new google.maps.LatLng(cLatLng.lat(), newCenterLng);
            this.map.panTo(newCenter);       //设置中心点，有动画效果

            var bounds = this.map.getBounds();
            var southWest = bounds.getSouthWest();
            var northEast = bounds.getNorthEast();

            if (rightLng + moveLng > northEast.lng() && northEast.lng() > 0) {
                this.map.setZoom(this.map.getZoom() - 1);
            }
        },


        decodePath: function (path) {
            return google.maps.geometry.encoding.decodePath(path);
        }

    };

    QyMap.pixelToLat = function (pixelY, zoom) {
        //像素Y到纬度
        var y = 2 * Math.PI * (1 - pixelY / (128 << zoom));
        var z = Math.pow(Math.E, y);
        var siny = (z - 1) / (z + 1);
        return Math.asin(siny) * 180 / Math.PI;
    }


    QyMap.latToPixel = function (lat, zoom) {
        //纬度到像素Y
        var siny, y;

        siny = Math.sin(lat * Math.PI / 180);
        y = Math.log((1 + siny) / (1 - siny));

        return (128 * Math.pow(2, zoom)) * (1 - y / (2 * Math.PI));
    }

    QyMap.lngToPixel = function (lng, zoom) {
        //经度到像素
        return (lng + 180) * (256 * Math.pow(2, zoom)) / 360;
    };

    QyMap.pixelToLng = function (pixelX, zoom) {
        //像素到经度
        //return pixelX * 360 / (256 << zoom) - 180;
        return pixelX * 360 / (256 * Math.pow(2, zoom)) - 180;

    }

    QyMap.toggleBounce = function (marker) {
        //marker动画，跳动感
        if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    QyMap.mapLoadIsOk = false;  //地图是否加载成功
    QyMap.LableMarker = '';     //LableMarker对象
    QyMap.loadGoogleMap = function (mapCbFun) {
        if (QyMap.mapLoadIsOk) {
            mapCbFun();
        } else {
            window.googleMapCbFun = function () {
                requirejs(['common/ui/map/LableMarker'], function (LableMarker) {
                    QyMap.LableMarker = LableMarker;
                    mapCbFun();
                });
            }
            $.getScript('http://maps.google.cn/maps/api/js?libraries=geometry&sensor=false&key=AIzaSyDuVPF7CxcYsNQhLlwCbTMgThoUl0UQHhg&callback=googleMapCbFun');
        }
    }


    return QyMap;

});